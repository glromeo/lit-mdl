import {css, customElement, html, property, query, queryAll} from 'lit-element';
import {classMap} from "lit-html/directives/class-map.js";
import {ifDefined} from "lit-html/directives/if-defined.js";
import {MdlComponent} from "../mdl-base";
import {KEY_DOWN, KEY_ESCAPE, KEY_UP} from "../keycode.js";
import {escapeRegExp} from "../util.js";
import {MaterialRipple} from "../ripple.js";

// const highlightSearch = directive((search) => (part) => { part.setValue('Hello')});
import rippleStyle from "../ripple.scss";

@customElement("mdl-autocomplete")
export class MdlAutocomplete extends MdlComponent {

    static get styles() {
        return [
            super.styles,
            rippleStyle,
            css`
                .mdl-menu {
                    transition: clip .2s; 
                }
                
                .is-visible > .mdl-menu {
                    clip: auto;
                }
                
                .highlight {
                    background-color: yellow;
                    font-weight: bold;
                }
                
                li.active {
                    background-color: #e8e8e8;
                }
                
                input::placeholder {  
                    color: lightgray; 
                } 
                
                .material-icons {
                    user-select: none; 
                }
            `
        ]
    }

    @property({type: String})
    label = "Label";

    @property({type: String})
    text;

    @property({type: Object})
    value;

    @property({attribute: "active", type: Boolean})
    isActive = false;

    constructor() {
        super();
    }

    focus(event) {
        this.isActive = true;
    }

    focusToggle(event) {
        this.isActive = !this.isActive;
    }

    blur(event) {
        this.isActive = false;
    }

    @query(".mdl-textfield__input")
    textfield;

    @query(".mdl-menu")
    menuElement;

    change() {
        this.value = this.textfield.value;
        console.log("change", this.value);
    }

    @property({type: Object})
    search;

    input() {
        this.setAttribute("text", this.textfield.value);
    }

    clearTextfield() {
        this.textfield.value = "";
        this.search = null;
    }

    keyUp({keyCode}) {
        switch (keyCode) {
            case KEY_ESCAPE:
                this.clearTextfield();
                return;
            case KEY_DOWN:
                do {
                    this.activeIndex = Math.min(this.activeIndex + 1, this.suggestions.length - 1);
                } while (this.suggestions[this.activeIndex].disabled);
                return;
            case KEY_UP:
                do {
                    this.activeIndex = Math.max(this.activeIndex - 1, 0);
                } while (this.suggestions[this.activeIndex].disabled);
                return;
        }
    }

    @property()
    suggestions = [
        {text: "Some Action"},
        {text: "Another Action", divided: true},
        {text: "Disabled Action", disabled: true},
        {text: "Yet Another Action"}
    ];

    @property()
    activeIndex = -1;

    @property()
    menuWidth = 0;

    @property()
    menuHeight = 0;

    @property()
    visibility = 'hidden';

    firstUpdated() {
        this.menuElement.parentElement.addEventListener('transitionend', (event) => {
            if (event.propertyName === 'transform') {
                this.visibility = this.isActive ? "visible" : "hidden";
            }
        });
        this.resizeMenu();
    }

    updated(changedProperties) {

        if (changedProperties.has("text")) {
            this.search = this.text ? new RegExp(escapeRegExp(this.text), "ig") : null;
        }

        if (changedProperties.has("suggestions")) setTimeout(() => {
            for (const element of this.menuElement.querySelectorAll(".mdl-menu__item")) {
                if (!element.ripple) element.ripple = new MaterialRipple(element);
            }
            this.resizeMenu();
        }, 50);

        if (changedProperties.has("search")) {
            this.resizeMenu();
        }
    }

    resizeMenu() {
        let {width} = this.textfield.getBoundingClientRect();
        if (this.menuWidth !== width) {
            this.menuWidth = width;
        }

        let height = 0;
        for (const element of this.menuElement.querySelectorAll(".mdl-menu__item")) {
            height += element.clientHeight;
        }
        if (this.menuHeight !== height) {
            this.menuHeight = height;
        }
    }

    clickSuggestions({target}) {
        this.value = this.textfield.value = this.suggestions[target.index].text;
        this.dismiss();
    }

    dismiss() {
        this.textfield.focus();
        this.textfield.blur();
    }

    highlightSearch(text) {
        if (this.search) {
            const parts = [];
            let lastIndex = this.search.lastIndex = 0;
            let found = 0, result = this.search.exec(text);
            while (result) {
                ++found;
                parts.push({
                    text: text.substring(lastIndex, result.index),
                    highlight: false
                });
                parts.push({
                    text: result[0],
                    highlight: true
                });
                lastIndex = this.search.lastIndex;
                result = this.search.exec(text);
            }
            parts.push({
                text: text.substring(lastIndex, text.length),
                highlight: false
            });
            return found > 0 ? parts.filter(part => part.text).map(part => {
                if (part.highlight) {
                    return html`<span class="highlight">${part.text}</span>`;
                } else {
                    return html`${part.text}`;
                }
            }) : null;
        } else {
            return text ? html`${text}` : null;
        }
    }

    render() {
        const textFieldClass = classMap({
            "is-focused": this.isActive,
            "is-dirty": this.value
        });
        const menuClass = classMap({
            "is-visible": this.isActive
        });
        const placeholder = this.isActive && !this.value ? "placeholder" : undefined;
        return html`
            <div class="mdl-textfield mdl-js-textfield mdl-textfield--floating-label ${textFieldClass}" @keyup=${this.keyUp}>
                <input class="mdl-textfield__input" type="text" placeholder="${ifDefined(placeholder)}" @focus=${this.focus} @blur=${this.blur} @input=${this.input} @change=${this.change}>
                <i class="material-icons md-18" @click=${this.focusToggle} style="position: absolute; right: 0; bottom: 24px;">
                ${this.isActive ? "arrow_drop_up" : "arrow_drop_down"}
                </i>
                <label class="mdl-textfield__label">${this.label}</label>
            </div>
            <div class="mdl-menu__container is-upgraded ${menuClass}" style="position: relative; left: 0px; bottom: 20px; width: 0; height: 0; overflow: visible;"
                 @click=${this.clickSuggestions} @keyup=${this.keyUp}>
                <div class="mdl-menu__outline" style="width: ${this.menuWidth}px; height: ${this.menuHeight + 16}px;"></div>
                <ul class="mdl-menu"
                    style="visibility: ${this.visibility}; width: ${this.menuWidth}px; height: ${this.menuHeight + 16}px;">
                    ${this.suggestions.map(this.renderMenuItem)}
                </ul>
            </div>
        `;
    }

    renderMenuItem = (item, index) => {
        const itemHTML = this.highlightSearch(item.text);
        const itemClassName = classMap({
            "mdl-menu__item--full-bleed-divider": item.divided,
            "active": index === this.activeIndex
        });
        if (itemHTML) {
            return html`
                    <li .index=${index} disabled="${ifDefined(item.disabled)}" 
                        class="mdl-menu__item mdl-js-ripple-effect ${itemClassName}">
                        ${itemHTML}
                        <span class="mdl-menu__item-ripple-container"><span class="mdl-ripple"></span></span>
                    </li>
                `;
        } else return null;
    }
}