class Post
  constructor: (@root) ->
    header = $ '.comhead', @root
    comment = $ '.comment', @root

    @isDead      = comment.innerHTML.trim().match(/^\[[^\]]*\]$/) isnt null
    @level       = $.level @root
    @replies     = []
    @isCollapsed = false

    # Only run the following if we're not
    # dealing with a deleted/flagged/removed post
    unless @isDead
      @addCollapseLink header
      headerLinks = $$('a', header)
      userlink = headerLinks[0]
      itemlink = headerLinks[1]

      @username = userlink.innerHTML
      @id = Number itemlink.href.replace /^[^\d]*/, ''

      @createUserTooltip = ->
        userpos = userlink.getBoundingClientRect()
        userlinkPos = $.pos userlink
        c.log userlinkPos

        # Create the tooltip element and set its content
        tooltip = $.el 'div'
        tooltip.innerHTML = """
        <span>#{@username}</span>
        <br>
        #{if @userinfo.about then "<span>About: #{@userinfo.about}</span>" else ''}
        """

        # Style the tooltip
        tooltip.style.cssText = "
        width: 300px;
        height: 100px;
        padding: 5px;
        position: absolute;
        left: #{userlinkPos.left};
        top: #{userlinkPos.top - 100 - (userlinkPos.height / 2)};
        background-color: #f6f6ef;
        border: 2px solid #ff6600;
        border-radius: 4px;
        overflow: hidden;
        "

        $.on tooltip, 'mouseenter', (evt) =>
          @showUserTooltip()
          $.off userlink, 'mouseleave', mouseLeaveHandler

        $.on tooltip, 'mouseleave', (evt) =>
          @hideUserTooltip()
          $.on userlink, 'mouseleave', mouseLeaveHandler

        @root.appendChild tooltip
        @tooltip = tooltip

      @showUserTooltip = ->
        @tooltip.style.display = ''

      @hideUserTooltip = ->
        @tooltip.style.display = 'none'

      mouseEnterHandler = (evt) =>
        unless @userinfo
          Ajax.user @username, (user) =>
            @userinfo = user
            @createUserTooltip()
            createdAt = new Date user.created * 1000
            c.log """
            Username: #{user.id}
            Created At: #{createdAt}
            About: #{user.about}
            Karma: #{user.karma}
            """
        else
          @showUserTooltip()
          c.log @userinfo

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

    header.appendChild separator
    header.appendChild link

  show: ->
    reply.show() for reply in @replies unless @isCollapsed
    @root.style.display = ''
  hide: ->
    reply.hide() for reply in @replies
    @root.style.display = 'none'
  countReplies: ->
    totalReplies = @replies.length
    totalReplies += reply.countReplies() for reply in @replies
    totalReplies
