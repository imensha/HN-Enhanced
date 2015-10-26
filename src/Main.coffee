Main =
  init: $.ready.bind $, ->
    root = $.id 'hnmain'
    thread = $$('table', root)[2]
    posts = $$ 'tr.athing', thread

    topLevelPosts = []
    for el, i in posts
      postLevel = $.level el
      if postLevel is 0
        post = new Post el
        topLevelPosts.push Main.findReplies post, posts[i+1..]
    c.log topLevelPosts

  findReplies: (parent, replies) ->
    for el, i in replies
      replyLevel = $.level el
      if replyLevel is parent.level + 1
        reply = new Post el
        parent.replies.push reply
        Main.findReplies reply, replies[i+1..]
      else if replyLevel <= parent.level
        break
    parent

Main.init()
