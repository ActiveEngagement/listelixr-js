export type HTMLClassAttribute = string | string[] | Record<string,boolean|undefined|null>;

export type HTMLStyleAttribute = {
    [K in keyof CSSStyleDeclaration]?: string
} | string;

export type HTMLAttributes = Record<string,string|undefined|null>

export type ElementChildElement = ChildNode|string|undefined|null|false;
export type ElementChildren = (ElementChildElement)[] | ((el: Element) => ElementChildElement[]);

export type ElementOptions<T> = {
    tagName: T,
    el?: ChildNode | Element | null,
    class?: HTMLClassAttribute,
    style?: HTMLStyleAttribute,
    attrs?: HTMLAttributes,
    children?: ElementChildren,
    events?: {
        [K in keyof GlobalEventHandlers]?: GlobalEventHandlers[K]
    }
}

/**
 * Create a document element.
 */
export function el<T extends keyof HTMLElementTagNameMap>(options: ElementOptions<T>): HTMLElementTagNameMap[T] {
    const { el, tagName, attrs, class: classAttr, events, style: styleAttr } = options;
    
    const subject = el && 'tagName' in el && el?.tagName?.toLowerCase() === tagName.toLowerCase()
        ? el as HTMLElementTagNameMap[T]
        : document.createElement(tagName);

    // Remove the existing attributes
    if(el && 'attributes' in el && el?.attributes) {
        for(const { name } of el.attributes) {
            subject.removeAttribute(name);
        }
    }

    // Add the new attribute
    if(attrs) {
        for(const [key, value] of Object.entries(attrs)) {
            if(value === undefined || value === null) {
                subject.removeAttribute(key);
            }
            else {
                subject.setAttribute(key, value);
            }
        }
    }

    // Set the class attribute.
    if(classAttr) {
        const value = classes(classAttr);

        if(value) {
            subject.setAttribute('class', value);
        }
        else {
            subject.removeAttribute('class');
        }
    }

    // Set the style attribute
    if(styleAttr) {
        const value = style(styleAttr);

        if(value) {
            subject.setAttribute('style', value);
        }
        else {
            subject.removeAttribute('style');
        }
    }

    // Bind the events
    if(events) {
        for(const key in events) {
            const fn = events[key as keyof GlobalEventHandlers];

            if(!fn) {
                continue;
            }
            
            subject.addEventListener(key.replace(/^on/, ''), (event) => {
                // @ts-ignore
                fn.apply(subject, [event]);
            });
        }
    }

    let { children } = options;

    if(typeof children === 'function') {
        children = children(subject);
    }

    const childrenNodes = children?.filter(
        value => typeof value === 'string' || value instanceof Node
    ) as (ChildNode|string)[] | undefined;

    if(childrenNodes && childrenNodes.length) {
        for(let i = 0; i < childrenNodes.length; i++) {
            const child = childrenNodes[i];
            const childNode = subject.childNodes.item(i);

            if(childNode === child) {
                continue;
            }

            if(!subject.childNodes[i]) {
                let matches: RegExpMatchArray | null;

                if(typeof child === 'string' && (matches = child.match(/\<\!\-\-(.+?)\-\->/))) {
                    subject.append(document.createComment(matches[1]));
                }
                else {
                    subject.append(child);
                }
            }
            else {
                childNode.replaceWith(child);
            }
        }
        
        while(subject.childNodes.length > (childrenNodes?.length ?? 0)) {
            subject.childNodes[subject.childNodes.length - 1]?.remove();
        }
    }
    else {
        while(subject.childNodes.length) {
            subject.lastChild?.remove();
        }
    }

    return subject;
}

/**
 * Derive the class attribute value.
 */
export function classes(values?: HTMLClassAttribute): string {
    if(!values) {
        return '';
    }
    
    const classes: string[] = [];

    if(typeof values === 'string') {
        classes.push(values); 
    }
    else if(Array.isArray(values)) {
        classes.push(...values);
    }
    else if(values) {
        for(const [key, value] of Object.entries(values)) {
            if(value) {
                classes.push(...key.split(' '));
            }
        }
    }

    return classes.join(' ');
}

/**
 * Derive the style attribute value.
 */
export function style(value: HTMLStyleAttribute): string {
    if(typeof value === 'string') {
        return value;
    }

    return Object.entries(value).map(([key, value]) => {
        return `${key}:${value}`;
    }).join(';');
}

/**
 * Gets the perceived value of an HTML "boolean attribute" from an object of attributes.
 *
 * HTML boolean attributes are those that represent a "true" or "false" value. Unfortunately, HTML is a bit funny with
 * these. Essentially, if the element contains the attribute (**no matter the value**), then it is "on" or "true."
 * If the element does not contain the attribute, then it is "off" or "false."
 *
 * This can produce some counterintuitive behavior. For instance, a `<input required="false" />` is required, as is
 * a `<input required=0>`. The only case in which the input is not required is a simple `<input />`, without the
 * required attribute at all.
 *
 * Therefore, the only values that correspond to a "false attribute" are `null` and `undefined`. Anything else is
 * considered true.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML
 */
export function booleanAttrValue(attrs: Record<string, unknown>|undefined|null, attrName: string): boolean
{
    return !!attrs && attrName in attrs && attrs[attrName] !== null && attrs[attrName] !== undefined;
}

/**
 * Sets the perceived value of an HTML "boolean attribute" on an object of attributes.
 *
 * HTML boolean attributes are those that represent a "true" or "false" value. Unfortunately, HTML is a bit funny with
 * these. Essentially, if the element contains the attribute (**no matter the value**), then it is "on" or "true."
 * If the element does not contain the attribute, then it is "off" or "false."
 *
 * This can produce some counterintuitive behavior. For instance, a `<input required="false" />` is required, as is
 * a `<input required=0>`. The only case in which the input is not required is a simple `<input />`, without the
 * required attribute at all.
 *
 * Therefore, we set an empty string for a "true attribute," which results in an element like `<input required>`, and
 * we set undefined for a "false attribute," which (in our DOM functions at least) results in the attribute being
 * removed.
 *
 * @see https://developer.mozilla.org/en-US/docs/Glossary/Boolean/HTML
 */
export function setBooleanAttrValue(attrs: Record<string, unknown>, attrName: string, value: boolean)
{
    attrs[attrName] = value ? '' : undefined;
}
