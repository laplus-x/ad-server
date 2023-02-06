(function(){
    function tracking(event, id) {
        var pixel = document.createElement("img")
        pixel.src = "{{.BaseURL}}/api/request/{{.RequestID}}/asset/"+id+"/event/"+event
    }

    function createContent() {
        var fragment = document.createDocumentFragment();
        var wrapper = document.createElement("div")
        wrapper.className = "wrp"
        var img = document.createElement("img")
        img.id = "{{.Creative.Detail.Image.ID}}"
        img.src = "{{.Creative.Detail.Image.URI}}"
        img.onload = function() {
            tracking("impression", this.id)
        }
        img.onclick = function() {
            tracking("click", this.id)
            window.open("{{.Creative.Detail.Image.LandingPage}}", '_blank').focus();
        }
        wrapper.appendChild(img)
        fragment.appendChild(wrapper)
        return fragment
    }

    function createStyle() {
        var style = document.createElement("style")
        style.innerHTML = `
        .wrp { 
            height: {{.Creative.Height}}px;
            width: {{.Creative.Width}}px;
        }
        .wrp img {
            height: 100%;
            width: 100%;
        }
        `
        return style
    }

    var target = document.currentScript
    var ifr = document.createElement("iframe");
    ifr.id = "{{.RequestID}}"
    ifr.height = "{{.Creative.Height}}"
    ifr.width = "{{.Creative.Width}}"
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
    ifr.style.setProperty("max-height", "{{.Creative.Height}}px", "important")
    ifr.style.setProperty("min-height", "{{.Creative.Height}}px", "important")
    ifr.style.setProperty("height", "{{.Creative.Height}}px", "important")
    ifr.style.setProperty("max-width", "{{.Creative.Width}}px", "important")
    ifr.style.setProperty("min-width", "{{.Creative.Width}}px", "important")
    ifr.style.setProperty("width", "{{.Creative.Width}}px", "important")
    ifr.onload = function() {
        this.contentDocument.head.appendChild(createStyle());
        this.contentDocument.body.appendChild(createContent());        
    }
    target.parentNode.insertBefore(ifr, target)
})();