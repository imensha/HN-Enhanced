Ajax =
  item: (id, fn) ->
    GM_xmlhttpRequest
      url: "https://hacker-news.firebaseio.com/v0/item/#{id}.json"
      method: 'GET'
      onload: (response) ->
        item = JSON.parse response.responseText
        fn item
  user: (username, fn) ->
    GM_xmlhttpRequest
      url: "https://hacker-news.firebaseio.com/v0/user/#{username}.json"
      method: 'GET'
      onload: (response) ->
        user = JSON.parse response.responseText
        fn user
