class Post
  constructor: (root) ->
    header = $ '.comhead', root
    comment = $ '.comment', root

    @isDead      = comment.innerHTML.trim().match(/^\[[^\]]*\]$/) isnt null
    @level       = $.level root
    @replies     = []
    @isCollapsed = false

    @nodes =
      root: root
      header: header
      comment: comment

    # Only run the following if we're not
    # dealing with a deleted/flagged/removed post
    unless @isDead
      @addCollapseLink header
      headerLinks = $$('a', header)
      userlink = headerLinks[0]
      itemlink = headerLinks[1]

      @nodes.userlink = userlink
      @nodes.itemlink = itemlink

      username = userlink.innerHTML
      unless g.USERS[username]
        @user = new User username
        g.USERS[username] = @user
      else
        @user = g.USERS[username]
      @user.onReady @createUserTooltip.bind @

      @id = Number itemlink.href.replace /^[^\d]*/, ''

      @showUserTooltip = ->
        @nodes.tooltip.style.display = ''

      @hideUserTooltip = ->
        @nodes.tooltip.style.display = 'none'

      mouseEnterHandler = (evt) =>
        if @user.isInitialized
          @showUserTooltip()
        else
          @user.init()
          @user.onReady @showUserTooltip.bind @

      mouseLeaveHandler = (evt) =>
        @hideUserTooltip()

      $.on userlink, 'mouseenter', mouseEnterHandler

      $.on userlink, 'mouseleave', mouseLeaveHandler

  addCollapseLink: (header) ->
    separator = $.el 'span', ' | '
    link = $.el 'a', '[-] Collapse'
    link.style.cursor = 'pointer'

    link.addEventListener 'click', (evt) =>
      evt.preventDefault()
      if @isCollapsed
        for reply in @replies
          reply.show()
        link.innerHTML = '[-] Collapse'
      else
        for reply in @replies
          reply.hide()
        link.innerHTML = "[+] Expand (#{@countReplies()} hidden)"
      @isCollapsed = !@isCollapsed

    @nodes.header.appendChild separator
    @nodes.header.appendChild link

  show: ->
    reply.show() for reply in @replies unless @isCollapsed
    @nodes.root.style.display = ''

  hide: ->
    reply.hide() for reply in @replies
    @nodes.root.style.display = 'none'

  countReplies: ->
    totalReplies = @replies.length
    totalReplies += reply.countReplies() for reply in @replies
    totalReplies

  createUserTooltip: ->
    log "Creating tooltip for #{@user.name} post #{@id}"
    userlinkPos = $.pos @nodes.userlink

    # Create the tooltip element and set its content
    tooltip = $.el 'div'
    tooltip.innerHTML = """
    <span>#{@user.name}</span>
    <br>
    #{if @user.about then "<span>About: #{@user.about}</span>" else ''}
    """

    # Style the tooltip
    tooltip.style.cssText = "
    width: 300px;
    height: 100px;
    padding: 5px;
    position: absolute;
    display: none;
    left: #{userlinkPos.left};
    top: #{userlinkPos.top - 100 - (userlinkPos.height / 2)};
    background-color: #f6f6ef;
    border: 2px solid #ff6600;
    border-radius: 4px;
    overflow: hidden;
    "

    $.on tooltip, 'mouseenter', (evt) =>
      @showUserTooltip()
      # $.off @nodes.userlink, 'mouseleave', mouseLeaveHandler

    $.on tooltip, 'mouseleave', (evt) =>
      @hideUserTooltip()
      # $.on @nodes.userlink, 'mouseleave', mouseLeaveHandler

    @nodes.root.appendChild tooltip
    @nodes.tooltip = tooltip
