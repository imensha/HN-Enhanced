// ==UserScript==
// @name        HN Enhanced
// @namespace   HNE
// @description Additional features for browsing Hacker News
// @include     https://news.ycombinator.com/item?id=*
// @version     0.1
// @grant       GM_xmlhttpRequest
// ==/UserScript==

(function() {
  var $, $$, Ajax, Main, Post, c, d, g, log,
    slice = [].slice;

  c = console;

  d = document;

  g = {};

  log = c.log.bind(c);

  $ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return root.querySelector(selector);
  };

  $$ = function(selector, root) {
    if (root == null) {
      root = d.body;
    }
    return slice.call(root.querySelectorAll(selector));
  };

  $.id = function(id) {
    return d.getElementById(id);
  };

  $.el = function(tag, content) {
    var el;
    if (content == null) {
      content = '';
    }
    el = d.createElement(tag);
    el.innerHTML = content;
    return el;
  };

  $.extend = function(target, properties) {
    var key, val;
    for (key in properties) {
      val = properties[key];
      if (typeof target[key] === 'object') {
        target[key] = $.extend(target[key], val);
      } else {
        target[key] = val;
      }
    }
    return target;
  };

  $.ready = function(fn) {
    if (typeof fn !== 'function') {
      return;
    }
    if (d.readyState = 'complete') {
      return fn();
    } else {
      return $.on(d, 'DOMContentLoaded', fn);
    }
  };

  $.on = function(el, events, handler) {
    var evt, j, len, ref, results;
    ref = events.split(' ');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      evt = ref[j];
      results.push(el.addEventListener(evt, handler));
    }
    return results;
  };

  $.off = function(el, events, handler) {
    var evt, j, len, ref, results;
    ref = events.split(' ');
    results = [];
    for (j = 0, len = ref.length; j < len; j++) {
      evt = ref[j];
      results.push(el.removeEventListener(evt, handler));
    }
    return results;
  };

  $.query = (function() {
    var i, j, len, param, query, search;
    query = {};
    search = location.search.slice(1).split('=');
    for (i = j = 0, len = search.length; j < len; i = j += 2) {
      param = search[i];
      query[param] = search[i + 1];
    }
    return query;
  })();

  $.pos = function(el, root) {
    var elementPos, k, rootPos, v;
    if (root == null) {
      root = d.body;
    }
    rootPos = root.getBoundingClientRect();
    elementPos = el.getBoundingClientRect();
    for (k in elementPos) {
      v = elementPos[k];
      if (!(k === 'width' || k === 'height')) {
        elementPos[k] = v - rootPos[k];
      }
    }
    return elementPos;
  };

  $.level = function(postEl) {
    var indent;
    indent = $('.ind', postEl);
    return Math.round($('img', indent).width / 40);
  };

  Ajax = {
    item: function(id, fn) {
      return GM_xmlhttpRequest({
        url: "https://hacker-news.firebaseio.com/v0/item/" + id + ".json",
        method: 'GET',
        onload: function(response) {
          var item;
          item = JSON.parse(response.responseText);
          return fn(item);
        }
      });
    },
    user: function(username, fn) {
      return GM_xmlhttpRequest({
        url: "https://hacker-news.firebaseio.com/v0/user/" + username + ".json",
        method: 'GET',
        onload: function(response) {
          var user;
          user = JSON.parse(response.responseText);
          return fn(user);
        }
      });
    }
  };

  Post = (function() {
    function Post(root1) {
      var comment, header, headerLinks, itemlink, mouseEnterHandler, mouseLeaveHandler, userlink;
      this.root = root1;
      header = $('.comhead', this.root);
      comment = $('.comment', this.root);
      this.isDead = comment.innerHTML.trim().match(/^\[[^\]]*\]$/) !== null;
      this.level = $.level(this.root);
      this.replies = [];
      this.isCollapsed = false;
      if (!this.isDead) {
        this.addCollapseLink(header);
        headerLinks = $$('a', header);
        userlink = headerLinks[0];
        itemlink = headerLinks[1];
        this.username = userlink.innerHTML;
        this.id = Number(itemlink.href.replace(/^[^\d]*/, ''));
        this.createUserTooltip = function() {
          var tooltip, userlinkPos, userpos;
          userpos = userlink.getBoundingClientRect();
          userlinkPos = $.pos(userlink);
          c.log(userlinkPos);
          tooltip = $.el('div');
          tooltip.innerHTML = "<span>" + this.username + "</span>\n<br>\n" + (this.userinfo.about ? "<span>About: " + this.userinfo.about + "</span>" : '');
          tooltip.style.cssText = "width: 300px; height: 100px; padding: 5px; position: absolute; left: " + userlinkPos.left + "; top: " + (userlinkPos.top - 100 - (userlinkPos.height / 2)) + "; background-color: #f6f6ef; border: 2px solid #ff6600; border-radius: 4px; overflow: hidden;";
          $.on(tooltip, 'mouseenter', (function(_this) {
            return function(evt) {
              _this.showUserTooltip();
              return $.off(userlink, 'mouseleave', mouseLeaveHandler);
            };
          })(this));
          $.on(tooltip, 'mouseleave', (function(_this) {
            return function(evt) {
              _this.hideUserTooltip();
              return $.on(userlink, 'mouseleave', mouseLeaveHandler);
            };
          })(this));
          this.root.appendChild(tooltip);
          return this.tooltip = tooltip;
        };
        this.showUserTooltip = function() {
          return this.tooltip.style.display = '';
        };
        this.hideUserTooltip = function() {
          return this.tooltip.style.display = 'none';
        };
        mouseEnterHandler = (function(_this) {
          return function(evt) {
            if (!_this.userinfo) {
              return Ajax.user(_this.username, function(user) {
                var createdAt;
                _this.userinfo = user;
                _this.createUserTooltip();
                createdAt = new Date(user.created * 1000);
                return c.log("Username: " + user.id + "\nCreated At: " + createdAt + "\nAbout: " + user.about + "\nKarma: " + user.karma);
              });
            } else {
              _this.showUserTooltip();
              return c.log(_this.userinfo);
            }
          };
        })(this);
        mouseLeaveHandler = (function(_this) {
          return function(evt) {
            return _this.hideUserTooltip();
          };
        })(this);
        $.on(userlink, 'mouseenter', mouseEnterHandler);
        $.on(userlink, 'mouseleave', mouseLeaveHandler);
      }
    }

    Post.prototype.addCollapseLink = function(header) {
      var link, separator;
      separator = $.el('span', ' | ');
      link = $.el('a', '[-] Collapse');
      link.style.cursor = 'pointer';
      link.addEventListener('click', (function(_this) {
        return function(evt) {
          var j, l, len, len1, ref, ref1, reply;
          evt.preventDefault();
          if (_this.isCollapsed) {
            ref = _this.replies;
            for (j = 0, len = ref.length; j < len; j++) {
              reply = ref[j];
              reply.show();
            }
            link.innerHTML = '[-] Collapse';
          } else {
            ref1 = _this.replies;
            for (l = 0, len1 = ref1.length; l < len1; l++) {
              reply = ref1[l];
              reply.hide();
            }
            link.innerHTML = "[+] Expand (" + (_this.countReplies()) + " hidden)";
          }
          return _this.isCollapsed = !_this.isCollapsed;
        };
      })(this));
      header.appendChild(separator);
      return header.appendChild(link);
    };

    Post.prototype.show = function() {
      var j, len, ref, reply;
      if (!this.isCollapsed) {
        ref = this.replies;
        for (j = 0, len = ref.length; j < len; j++) {
          reply = ref[j];
          reply.show();
        }
      }
      return this.root.style.display = '';
    };

    Post.prototype.hide = function() {
      var j, len, ref, reply;
      ref = this.replies;
      for (j = 0, len = ref.length; j < len; j++) {
        reply = ref[j];
        reply.hide();
      }
      return this.root.style.display = 'none';
    };

    Post.prototype.countReplies = function() {
      var j, len, ref, reply, totalReplies;
      totalReplies = this.replies.length;
      ref = this.replies;
      for (j = 0, len = ref.length; j < len; j++) {
        reply = ref[j];
        totalReplies += reply.countReplies();
      }
      return totalReplies;
    };

    return Post;

  })();

  Main = {
    init: $.ready.bind($, function() {
      var el, i, j, len, post, postLevel, posts, root, thread, topLevelPosts;
      root = $.id('hnmain');
      thread = $$('table', root)[2];
      posts = $$('tr.athing', thread);
      topLevelPosts = [];
      for (i = j = 0, len = posts.length; j < len; i = ++j) {
        el = posts[i];
        postLevel = $.level(el);
        if (postLevel === 0) {
          post = new Post(el);
          topLevelPosts.push(Main.findReplies(post, posts.slice(i + 1)));
        }
      }
      return c.log(topLevelPosts);
    }),
    findReplies: function(parent, replies) {
      var el, i, j, len, reply, replyLevel;
      for (i = j = 0, len = replies.length; j < len; i = ++j) {
        el = replies[i];
        replyLevel = $.level(el);
        if (replyLevel === parent.level + 1) {
          reply = new Post(el);
          parent.replies.push(reply);
          Main.findReplies(reply, replies.slice(i + 1));
        } else if (replyLevel <= parent.level) {
          break;
        }
      }
      return parent;
    }
  };

  Main.init();

}).call(this);
