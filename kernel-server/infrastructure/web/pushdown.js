(function(){
    function tracking(event, id) {
        var pixel = document.createElement("img")
        pixel.src = "{{.BaseURL}}/api/request/{{.RequestID}}/asset/"+id+"/event/"+event
    }

    function createContent() {
        var fragment = document.createDocumentFragment();
        var btn = document.createElement("button")
        btn.className = "btn"
        btn.onclick = function() {
            this.style.setProperty("visibility", "hidden")
            var wrappers = document.getElementsByClassName('wrp');
            wrappers[1].style.setProperty("display", "none")
            wrappers[0].style.setProperty("display", "block")
            ifr.style.setProperty("height", "250px", "important")
        }
        fragment.appendChild(btn)

        {{ range $i, $img := .Creative.Detail.Images }}
        var wrapper = document.createElement("div")
        wrapper.className = "wrp"
        var img = document.createElement("img")
        img.id = "{{$img.ID}}"
        img.src = "{{$img.URI}}"
        img.onload = function() {
            tracking("impression", this.id)
        }
        img.onclick = function() {
            {{ if eq $i 0 }}
            btn.style.setProperty("visibility", "visible")
            var wrappers = document.getElementsByClassName('wrp');
            wrappers[0].style.setProperty("display", "none")
            wrappers[1].style.setProperty("display", "block")
            ifr.style.setProperty("height", "500px", "important")
            {{ else }}
            tracking("click", this.id)
            window.open("{{$img.LandingPage}}", '_blank').focus();
            {{ end }}
        }
        wrapper.appendChild(img)
        fragment.appendChild(wrapper)
        {{end}}
        return fragment
    }

    function createStyle() {
        var style = document.createElement("style")
        style.innerHTML = `
        .wrp {
            width: 970px;
        }
        .wrp:first-child {
            height: 250px;
        }
        .wrp:last-child {
            height: 500px;
            display: none;
        }
        .btn {
            z-index: 9999999999;
            width: 18px; 
            height: 18px; 
            padding: 3px;
            top: 0px; 
            right: 0px;
            position: absolute;
            background-image: url("data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz48IURPQ1RZUEUgc3ZnIFBVQkxJQyAiLS8vVzNDLy9EVEQgU1ZHIDEuMS8vRU4iICJodHRwOi8vd3d3LnczLm9yZy9HcmFwaGljcy9TVkcvMS4xL0RURC9zdmcxMS5kdGQiPjxzdmcgdmVyc2lvbj0iMS4xIiBpZD0iTGF5ZXJfMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSIyNHB4IiBoZWlnaHQ9IjI0cHgiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZW5hYmxlLWJhY2tncm91bmQ9Im5ldyAwIDAgMjQgMjQiIHhtbDpzcGFjZT0icHJlc2VydmUiPjxwYXRoIG9wYWNpdHk9IjAuOCIgZmlsbD0iIzQwNDA0MCIgZD0iTTAuMDU1LDB2MjRoMjRWMEgwLjA1NXogTTE2LjUyNSwxOC4xNzFMMTIsMTMuNjQ2bC00LjUyNiw0LjUyNGwtMS42NDUtMS42NDZMMTAuMzU0LDEyTDUuODI5LDcuNDc1TDcuNDc0LDUuODNMMTIsMTAuMzU0bDQuNTI1LTQuNTI1bDEuNjQ2LDEuNjQ2TDEzLjY0NSwxMmw0LjUyNiw0LjUyNUwxNi41MjUsMTguMTcxeiIvPjwvc3ZnPg==");
        }
        `
        return style
    }

    var target = document.currentScript
    var ifr = document.createElement("iframe");
    ifr.id = "{{.RequestID}}"
    ifr.height = "250"
    ifr.width = "970"
    ifr.marginheight = "0"
    ifr.marginwidth = "0"
    ifr.scrolling = "no"
    ifr.frameBorder = 0
    ifr.allowFullscreen = false
    ifr.style.setProperty("border", "0", "important")
    ifr.style.setProperty("overflow", "hidden", "important")
    ifr.style.setProperty("padding", "0px", "important")
    ifr.style.setProperty("margin", "0px auto", "important")
    ifr.style.setProperty("top", "0px", "important")
    ifr.style.setProperty("left", "0px", "important")
    ifr.style.setProperty("position", "absolute", "important")
    ifr.style.setProperty("max-height", "500px", "important")
    ifr.style.setProperty("min-height", "250px", "important")
    ifr.style.setProperty("height", "250px", "important")
    ifr.style.setProperty("max-width", "970px", "important")
    ifr.style.setProperty("min-width", "970px", "important")
    ifr.style.setProperty("width", "970px", "important")
    ifr.style.setProperty("transition", "height 3s", "important")
    ifr.onload = function() {
        this.contentDocument.head.appendChild(createStyle());
        this.contentDocument.body.appendChild(createContent());        
    }
    target.parentNode.insertBefore(ifr, target)
})();