class User
  constructor: (@name) ->
    @id = @name
    @isInitialized = false

    cb = []

    @init = ->
      Ajax.user @name, (user) =>
        @created   = user.created
        @createdAt = new Date user.created * 1000
        @karma     = user.karma
        @about     = user.about

        @isInitialized = true
        fn @ for fn in cb

    @onReady = (fn) ->
      return unless typeof fn is 'function'
      if @isInitialized
        fn @
      else
        cb.push fn
