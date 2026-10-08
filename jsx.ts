// jsx.ts: a tiny JSX-to-HTML-string renderer. It replaces react and react-dom/server,
// so the project needs no dependencies at all. Plain TypeScript: the same file works for Bun and Node.
//
// Needs these tsconfig.json settings, and `import { h, Fragment } from "./jsx"` in every .tsx file:
//   "jsx": "react", "jsxFactory": "h", "jsxFragmentFactory": "Fragment"
// Because `h` is the JSX factory, never use `h` as a variable name in a .tsx file.

type VNode = { tag: string; props: Record<string, any>; children: any[] };
type Ctx = { selectValue?: string }; // value of the <select> we are inside, used to mark the matching <option>

// Lets the editor type-check JSX without React's type definitions
declare global {
  namespace JSX {
    type Element = any;
    interface IntrinsicElements { [tag: string]: any }
  }
}

// What the compiler calls for every JSX tag. Components (functions) run right away;
// ordinary tags become small objects that render() turns into text later.
export function h(tag: any, props: any, ...children: any[]): any {
  props = props || {};
  if (typeof tag === "function") return tag({ ...props, children: children.length > 1 ? children : children[0] });
  return { tag, props, children } as VNode;
}

export function Fragment(props: { children?: any }) { return props.children; }

// Turn JSX into an HTML string
export function render(node: any): string { return renderChildren(node, {}); }

// ---------- everything below is internal ----------

// Escape text and attribute values so applicant notes containing < > & " ' can never become HTML
const ESC: Record<string, string> = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#x27;" };
const esc = (s: any) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

const VOID = new Set(["area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"]);

// React-style attribute names that differ in HTML
const ATTR: Record<string, string> = {
  charSet: "charset", htmlFor: "for", encType: "enctype", readOnly: "readonly", className: "class",
  tabIndex: "tabindex", colSpan: "colspan", rowSpan: "rowspan", maxLength: "maxlength",
  autoComplete: "autocomplete", autoFocus: "autofocus", acceptCharset: "accept-charset",
  httpEquiv: "http-equiv", spellCheck: "spellcheck", crossOrigin: "crossorigin",
  defaultValue: "value", defaultChecked: "checked",
};

// style values that are plain numbers get "px" added, except these
const UNITLESS = new Set(["flex", "flexGrow", "flexShrink", "fontWeight", "lineHeight", "opacity", "order", "zIndex", "zoom"]);

function styleToCss(style: Record<string, any>): string {
  return Object.entries(style)
    .filter(([, v]) => v != null && v !== false && v !== "")
    .map(([k, v]) => {
      const prop = k.startsWith("--") ? k : k.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase()); // fontSize -> font-size
      const val = typeof v === "number" && v !== 0 && !UNITLESS.has(k) ? v + "px" : String(v);
      return `${prop}:${val}`;
    })
    .join(";");
}

function plainText(c: any): string {
  if (c == null || typeof c === "boolean") return "";
  if (Array.isArray(c)) return c.map(plainText).join("");
  return typeof c === "object" ? "" : String(c);
}

function renderChildren(c: any, ctx: Ctx): string {
  if (c == null || typeof c === "boolean") return ""; // null, undefined, true, false render nothing
  if (Array.isArray(c)) return c.map((x) => renderChildren(x, ctx)).join("");
  if (typeof c === "object") return renderNode(c as VNode, ctx);
  return esc(c); // strings and numbers
}

function renderNode({ tag, props, children }: VNode, ctx: Ctx): string {
  const isSelect = tag === "select", isTextarea = tag === "textarea";
  let childCtx = ctx;
  if (isSelect) {
    const sv = props.value ?? props.defaultValue;
    if (sv != null) childCtx = { selectValue: String(sv) };
  }

  let attrs = "";
  for (const [k, v] of Object.entries(props)) {
    if (k === "key" || k === "ref" || k === "children" || k === "dangerouslySetInnerHTML") continue;
    if (/^on[A-Z]/.test(k)) continue; // event handlers mean nothing in a static page
    if ((isSelect || isTextarea) && (k === "value" || k === "defaultValue")) continue; // handled elsewhere
    if (k === "style") {
      if (v && typeof v === "object") { const css = styleToCss(v); if (css) attrs += ` style="${esc(css)}"`; }
      continue;
    }
    const name = ATTR[k] ?? k;
    if (v === true && !/^(data|aria)-/.test(k)) attrs += ` ${name}=""`;
    else if (v == null || v === false) continue;
    else attrs += ` ${name}="${esc(v)}"`;
  }

  // mark the <option> that matches the enclosing <select value=...>
  if (tag === "option" && ctx.selectValue !== undefined) {
    if (String(props.value ?? plainText(children)) === ctx.selectValue) attrs += ` selected=""`;
  }

  if (VOID.has(tag)) return `<${tag}${attrs}>`;

  let inner: string;
  if (props.dangerouslySetInnerHTML) inner = String(props.dangerouslySetInnerHTML.__html ?? ""); // raw on purpose, only for our own script
  else if (isTextarea) {
    const text = String(props.value ?? props.defaultValue ?? plainText(children));
    inner = (text.startsWith("\n") ? "\n" : "") + esc(text); // browsers drop a newline right after <textarea>, so keep one extra
  } else inner = renderChildren(children, childCtx);

  return `<${tag}${attrs}>${inner}</${tag}>`;
}
