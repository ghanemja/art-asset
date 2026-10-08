// Optional React wrappers. Plain createElement so no build step is needed.
// Each component accepts `medium` (overrides the surrounding medium) and,
// where it makes sense, `variant` ("primary" | "secondary" | "accent").
import { createElement as h, forwardRef, useEffect, useRef } from 'react';
import { installFilters } from './art-medium.js';

const cx = (...c) => c.filter(Boolean).join(' ');
const variantClass = (v) => (v && v !== 'primary' ? `am--${v}` : null);

/** Sets the medium for a subtree and paints the paper background. */
export function MediumProvider({ medium = 'watercolor', as = 'div', canvas = true, className, children, ...rest }) {
  useEffect(() => installFilters(), []);
  return h(as, { 'data-medium': medium, className: cx(canvas && 'am-canvas', className), ...rest }, children);
}

export const Button = forwardRef(function Button({ variant, medium, className, ...rest }, ref) {
  return h('button', { ref, 'data-medium': medium, className: cx('am-button', variantClass(variant), className), ...rest });
});

export function Badge({ variant, medium, className, ...rest }) {
  return h('span', { 'data-medium': medium, className: cx('am-badge', variantClass(variant), className), ...rest });
}

export function Card({ title, medium, className, children, ...rest }) {
  return h('article', { 'data-medium': medium, className: cx('am-card', className), ...rest },
    title != null && h('h3', { className: 'am-card__title' }, title),
    children);
}

export const Input = forwardRef(function Input({ label, medium, className, multiline, ...rest }, ref) {
  const control = h('span', { className: 'am-input' }, h(multiline ? 'textarea' : 'input', { ref, ...rest }));
  return h('label', { 'data-medium': medium, className: cx('am-field', className) },
    label != null && h('span', { className: 'am-field__label' }, label),
    control);
});

export function Divider({ variant, medium, className, ...rest }) {
  return h('hr', { 'data-medium': medium, className: cx('am-divider', variantClass(variant), className), ...rest });
}

/** links: [{ href, label, current? }] */
export function Nav({ brand, brandHref = '/', links = [], medium, className, ...rest }) {
  return h('nav', { 'data-medium': medium, className: cx('am-nav', className), ...rest },
    brand != null && h('a', { className: 'am-nav__brand', href: brandHref }, brand),
    h('ul', { className: 'am-nav__links' },
      links.map((l) => h('li', { key: l.href },
        h('a', { className: 'am-nav__link', href: l.href, 'aria-current': l.current ? 'page' : undefined }, l.label)))));
}

/** A native <dialog>, opened modally while `open` is true. */
export function Modal({ open, onClose, title, medium, className, children, ...rest }) {
  const ref = useRef(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);
  return h('dialog', { ref, onClose, 'data-medium': medium, className: cx('am-modal', className), ...rest },
    title != null && h('h2', { className: 'am-modal__title' }, title),
    children);
}
