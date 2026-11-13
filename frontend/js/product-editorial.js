import { createProductImage } from './product-gallery.js';

// Editorial sections are repeated from product data and are built with DOM nodes.
// Using textContent for product copy avoids treating data as executable HTML.
function createElement(tag, className = '', text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function createLink(link, className = '') {
  const node = createElement('a', className, link.label);
  node.href = link.url;
  return node;
}

function createSectionHeading(eyebrow, title, centered = false) {
  const wrapper = createElement('div', `section-heading${centered ? ' centered' : ''}`);
  wrapper.append(
    createElement('p', 'eyebrow', eyebrow),
    createElement('h2', '', title)
  );
  return wrapper;
}

function createHighlights(features) {
  const section = createElement('section', 'feature-strip');
  section.setAttribute('aria-label', 'Product highlights');
  const iconLabels = { anc: '◌', materials: '◇', drivers: '◉', bluetooth: 'B' };

  for (const feature of features) {
    const item = createElement('article');
    const icon = createElement('span', 'feature-icon', iconLabels[feature.iconKey] ?? feature.title);
    icon.setAttribute('aria-hidden', 'true');
    const text = createElement('p');
    text.append(
      createElement('strong', '', feature.title),
      createElement('br'),
      document.createTextNode(feature.text)
    );
    item.append(icon, text);
    section.append(item);
  }
  return section;
}

function createBenefits(benefits) {
  const section = createElement('section', 'benefits-grid');
  section.setAttribute('aria-label', 'Purchase benefits');
  for (const benefit of benefits) {
    const item = createElement('article');
    item.append(
      createElement('h2', '', benefit.title),
      createElement('p', '', benefit.text)
    );
    section.append(item);
  }
  return section;
}

function createStory(story, index) {
  const section = createElement('section', `story-section ${index === 0 ? 'story-dark' : 'story-light'}`);
  const media = createElement('div', 'story-media');
  media.append(createProductImage(story.media));

  const copy = createElement('div', 'story-copy');
  copy.append(
    createElement('p', 'eyebrow', story.eyebrow),
    createElement('h2', '', story.title)
  );
  for (const paragraph of story.paragraphs) {
    copy.append(createElement('p', '', paragraph));
  }
  const links = createElement('div', 'story-links');
  for (const link of story.links) {
    links.append(createLink(link));
  }
  copy.append(links);
  section.append(...(index === 0 ? [media, copy] : [copy, media]));
  return section;
}

function createSpecifications(groups) {
  const section = createElement('section', 'specs-section');
  section.id = 'techSpecs';
  section.append(createSectionHeading('DETAILS', 'Tech Specs'));
  const accordions = createElement('div', 'accordion-list');

  groups.forEach((group, index) => {
    const initiallyOpen = index === 0;
    const item = createElement('article', `accordion${initiallyOpen ? ' open' : ''}`);
    const trigger = createElement('button', 'accordion-trigger');
    trigger.type = 'button';
    trigger.id = `specTrigger${index}`;
    trigger.setAttribute('aria-expanded', String(initiallyOpen));
    trigger.setAttribute('aria-controls', `specPanel${index}`);

    const sign = createElement('span', '', initiallyOpen ? '−' : '+');
    sign.setAttribute('aria-hidden', 'true');
    trigger.append(createElement('span', '', group.title), sign);

    const panel = createElement('div', 'accordion-panel');
    panel.id = `specPanel${index}`;
    panel.hidden = !initiallyOpen;
    panel.setAttribute('role', 'region');
    panel.setAttribute('aria-labelledby', trigger.id);

    const list = createElement('dl');
    for (const row of group.rows) {
      const detail = createElement('div');
      detail.append(
        createElement('dt', '', row.label),
        createElement('dd', '', row.value)
      );
      list.append(detail);
    }
    panel.append(list);
    item.append(trigger, panel);
    accordions.append(item);

    trigger.addEventListener('click', () => {
      const open = trigger.getAttribute('aria-expanded') !== 'true';
      trigger.setAttribute('aria-expanded', String(open));
      panel.hidden = !open;
      sign.textContent = open ? '−' : '+';
      item.classList.toggle('open', open);
    });
  });
  section.append(accordions);
  return section;
}

function createBoxContents(items) {
  const section = createElement('section', 'box-section');
  section.append(createSectionHeading('EVERYTHING YOU NEED', 'In The Box', true));
  const grid = createElement('div', 'box-grid');
  grid.id = 'boxGrid';

  for (const item of items) {
    const article = createElement('article');
    article.append(createProductImage(item.media), createElement('p', '', item.label));
    grid.append(article);
  }
  section.append(grid);
  return section;
}

function createSupport(support) {
  const section = createElement('section', 'support-section');
  const media = createElement('div', 'support-image');
  media.append(createProductImage(support.media));
  const copy = createElement('div', 'support-copy');
  copy.append(
    createElement('p', 'eyebrow', support.eyebrow),
    createElement('h2', '', support.title),
    createElement('p', '', support.text),
    createLink(support.link, 'outline-link')
  );
  section.append(media, copy);
  return section;
}

export function renderProductEditorial(product) {
  const content = product.content;
  const stories = content.stories.map(createStory);
  document.querySelector('#productContent').append(
    createHighlights(content.features),
    createBenefits(content.benefits),
    ...stories,
    createSpecifications(content.specGroups),
    createBoxContents(content.boxItems),
    createSupport(content.support)
  );
}
