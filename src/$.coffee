$ = (selector, root = d.body) ->
  root.querySelector selector
$$ = (selector, root = d.body) ->
  [root.querySelectorAll(selector)...]

$.id = (id) ->
  d.getElementById id

$.el = (tag, content = '') ->
  el = d.createElement tag
  el.innerHTML = content
  el

$.extend = (target, properties) ->
  for key, val of properties
    if typeof target[key] is 'object'
      target[key] = $.extend target[key], val
    else
      target[key] = val
  target

$.ready = (fn) ->
  return unless typeof fn is 'function'
  if d.readyState = 'complete'
    fn()
  else
    $.on d, 'DOMContentLoaded', fn

$.on = (el, events, handler) ->
  for evt in events.split ' '
    el.addEventListener evt, handler

$.off = (el, events, handler) ->
  for evt in events.split ' '
    el.removeEventListener evt, handler

$.query = do ->
  query = {}
  search = location.search.slice(1).split '='
  for param, i in search by 2
    query[param] = search[i+1]
  query

$.pos = (el, root = d.body) ->
  rootPos = root.getBoundingClientRect()
  elementPos = el.getBoundingClientRect()
  for k, v of elementPos
    elementPos[k] = v - rootPos[k] unless k is 'width' or k is 'height'
  elementPos

$.level = (postEl) ->
  indent = $ '.ind', postEl
  Math.round $('img', indent).width / 40
