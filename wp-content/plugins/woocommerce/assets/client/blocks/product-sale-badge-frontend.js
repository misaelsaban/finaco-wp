(self.webpackChunkwebpackWcBlocksFrontendJsonp=self.webpackChunkwebpackWcBlocksFrontendJsonp||[]).push([[5432],{5863:(e,t,o)=>{"use strict";o.r(t),o.d(t,{Block:()=>d,default:()=>f});var l=o(9196),n=o(5736),s=o(7608),r=o.n(s),c=o(711),a=o(2864),i=o(947),u=o(721);o(3902);const d=e=>{const{className:t,align:o}=e,s=(0,i.F)(e),{parentClassName:u}=(0,a.useInnerBlockLayoutContext)(),{product:d}=(0,a.useProductDataContext)();if(!(d.id&&d.on_sale||e.isDescendentOfSingleProductTemplate))return null;const f="string"==typeof o?`wc-block-components-product-sale-badge--align-${o}`:"";return(0,l.createElement)("div",{className:r()("wc-block-components-product-sale-badge",t,f,{[`${u}__product-onsale`]:u},s.className),style:s.style},(0,l.createElement)(c.Label,{label:(0,n.__)("Sale","woocommerce"),screenReaderLabel:(0,n.__)("Product on sale","woocommerce")}))},f=(0,u.withProductDataContext)(d)},947:(e,t,o)=>{"use strict";o.d(t,{F:()=>a});var l=o(7608),n=o.n(l),s=o(6946),r=o(3392),c=o(172);const a=e=>{const t=(e=>{const t=(0,s.isObject)(e)?e:{style:{}};let o=t.style;return(0,s.isString)(o)&&(o=JSON.parse(o)||{}),(0,s.isObject)(o)||(o={}),{...t,style:o}})(e),o=(0,c.vc)(t),l=(0,c.l8)(t),a=(0,c.su)(t),i=(0,r.f)(t);return{className:n()(i.className,o.className,l.className,a.className),style:{...i.style,...o.style,...l.style,...a.style}}}},3392:(e,t,o)=>{"use strict";o.d(t,{f:()=>n});var l=o(6946);const n=e=>{const t=(0,l.isObject)(e.style.typography)?e.style.typography:{},o=(0,l.isString)(t.fontFamily)?t.fontFamily:"";return{className:e.fontFamily?`has-${e.fontFamily}-font-family`:o,style:{fontSize:e.fontSize?`var(--wp--preset--font-size--${e.fontSize})`:t.fontSize,fontStyle:t.fontStyle,fontWeight:t.fontWeight,letterSpacing:t.letterSpacing,lineHeight:t.lineHeight,textDecoration:t.textDecoration,textTransform:t.textTransform}}}},172:(e,t,o)=>{"use strict";o.d(t,{l8:()=>d,su:()=>f,vc:()=>u});var l=o(7608),n=o.n(l),s=o(7427),r=o(2289),c=o(6946);function a(e={}){const t={};return(0,r.getCSSRules)(e,{selector:""}).forEach((e=>{t[e.key]=e.value})),t}function i(e,t){return e&&t?`has-${(0,s.o)(t)}-${e}`:""}function u(e){var t,o,l,s,r,u,d;const{backgroundColor:f,textColor:v,gradient:y,style:m}=e,g=i("background-color",f),p=i("color",v),b=function(e){if(e)return`has-${e}-gradient-background`}(y),k=b||(null==m||null===(t=m.color)||void 0===t?void 0:t.gradient);return{className:n()(p,b,{[g]:!k&&!!g,"has-text-color":v||(null==m||null===(o=m.color)||void 0===o?void 0:o.text),"has-background":f||(null==m||null===(l=m.color)||void 0===l?void 0:l.background)||y||(null==m||null===(s=m.color)||void 0===s?void 0:s.gradient),"has-link-color":(0,c.isObject)(null==m||null===(r=m.elements)||void 0===r?void 0:r.link)?null==m||null===(u=m.elements)||void 0===u||null===(d=u.link)||void 0===d?void 0:d.color:void 0}),style:a({color:(null==m?void 0:m.color)||{}})}}function d(e){var t;const o=(null===(t=e.style)||void 0===t?void 0:t.border)||{};return{className:function(e){var t;const{borderColor:o,style:l}=e,s=o?i("border-color",o):"";return n()({"has-border-color":!!o||!(null==l||null===(t=l.border)||void 0===t||!t.color),[s]:!!s})}(e),style:a({border:o})}}function f(e){var t;return{className:void 0,style:a({spacing:(null===(t=e.style)||void 0===t?void 0:t.spacing)||{}})}}},3902:()=>{}}]);