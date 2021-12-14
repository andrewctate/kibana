/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. Licensed under the Elastic License
 * 2.0; you may not use this file except in compliance with the Elastic License
 * 2.0.
 */

// copied from https://unpkg.com/browse/jsondiffpatch@0.4.1/dist/formatters-styles/html.css
// have to do inline style block because of content security policy
const htmlStyles = `.jsondiffpatch-delta {
    font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
    font-size: 12px;
    margin: 0;
    padding: 0 0 0 12px;
    display: inline-block;
  }
  .jsondiffpatch-delta pre {
    font-family: 'Bitstream Vera Sans Mono', 'DejaVu Sans Mono', Monaco, Courier, monospace;
    font-size: 12px;
    margin: 0;
    padding: 0;
    display: inline-block;
  }
  ul.jsondiffpatch-delta {
    list-style-type: none;
    padding: 0 0 0 20px;
    margin: 0;
  }
  .jsondiffpatch-delta ul {
    list-style-type: none;
    padding: 0 0 0 20px;
    margin: 0;
  }
  .jsondiffpatch-added .jsondiffpatch-property-name,
  .jsondiffpatch-added .jsondiffpatch-value pre,
  .jsondiffpatch-modified .jsondiffpatch-right-value pre,
  .jsondiffpatch-textdiff-added {
    background: #bbffbb;
  }
  .jsondiffpatch-deleted .jsondiffpatch-property-name,
  .jsondiffpatch-deleted pre,
  .jsondiffpatch-modified .jsondiffpatch-left-value pre,
  .jsondiffpatch-textdiff-deleted {
    background: #ffbbbb;
    text-decoration: line-through;
  }
  .jsondiffpatch-unchanged,
  .jsondiffpatch-movedestination {
    color: gray;
  }
  .jsondiffpatch-unchanged,
  .jsondiffpatch-movedestination > .jsondiffpatch-value {
    transition: all 0.5s;
    -webkit-transition: all 0.5s;
    overflow-y: hidden;
  }
  .jsondiffpatch-unchanged-showing .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-showing .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 100px;
  }
  .jsondiffpatch-unchanged-hidden .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 0;
  }
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value,
  .jsondiffpatch-unchanged-hidden .jsondiffpatch-movedestination > .jsondiffpatch-value {
    display: block;
  }
  .jsondiffpatch-unchanged-visible .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-visible .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 100px;
  }
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-unchanged,
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-movedestination > .jsondiffpatch-value {
    max-height: 0;
  }
  .jsondiffpatch-unchanged-showing .jsondiffpatch-arrow,
  .jsondiffpatch-unchanged-hiding .jsondiffpatch-arrow {
    display: none;
  }
  .jsondiffpatch-value {
    display: inline-block;
  }
  .jsondiffpatch-property-name {
    display: inline-block;
    padding-right: 5px;
    vertical-align: top;
  }
  .jsondiffpatch-property-name:after {
    content: ': ';
  }
  .jsondiffpatch-child-node-type-array > .jsondiffpatch-property-name:after {
    content: ': [';
  }
  .jsondiffpatch-child-node-type-array:after {
    content: '],';
  }
  div.jsondiffpatch-child-node-type-array:before {
    content: '[';
  }
  div.jsondiffpatch-child-node-type-array:after {
    content: ']';
  }
  .jsondiffpatch-child-node-type-object > .jsondiffpatch-property-name:after {
    content: ': {';
  }
  .jsondiffpatch-child-node-type-object:after {
    content: '},';
  }
  div.jsondiffpatch-child-node-type-object:before {
    content: '{';
  }
  div.jsondiffpatch-child-node-type-object:after {
    content: '}';
  }
  .jsondiffpatch-value pre:after {
    content: ',';
  }
  li:last-child > .jsondiffpatch-value pre:after,
  .jsondiffpatch-modified > .jsondiffpatch-left-value pre:after {
    content: '';
  }
  .jsondiffpatch-modified .jsondiffpatch-value {
    display: inline-block;
  }
  .jsondiffpatch-modified .jsondiffpatch-right-value {
    margin-left: 5px;
  }
  .jsondiffpatch-moved .jsondiffpatch-value {
    display: none;
  }
  .jsondiffpatch-moved .jsondiffpatch-moved-destination {
    display: inline-block;
    background: #ffffbb;
    color: #888;
  }
  .jsondiffpatch-moved .jsondiffpatch-moved-destination:before {
    content: ' => ';
  }
  ul.jsondiffpatch-textdiff {
    padding: 0;
  }
  .jsondiffpatch-textdiff-location {
    color: #bbb;
    display: inline-block;
    min-width: 60px;
  }
  .jsondiffpatch-textdiff-line {
    display: inline-block;
  }
  .jsondiffpatch-textdiff-line-number:after {
    content: ',';
  }
  .jsondiffpatch-error {
    background: red;
    color: white;
    font-weight: bold;
  }`;

const actionContainerId = 'action-header';
const diffContainerId = 'diff-container';

export class DiffLoggerWindow {
  private _window?: Window | null;

  private initializeWindow() {
    let ret;
    if ((ret = window.open('about:blank', undefined, 'popup=yes,width=1000,height=800'))) {
      const styles = ret.document.createElement('style');
      styles.appendChild(ret.document.createTextNode(htmlStyles));
      ret.document.head.appendChild(styles);

      const header = ret.document.createElement('h2');
      header.id = actionContainerId;
      ret.document.body.appendChild(header);

      const diffContainer = ret.document.createElement('div');
      diffContainer.id = diffContainerId;
      ret.document.body.appendChild(diffContainer);
    }
    return ret;
  }

  async printDiff({ actionType, prev, next }: { actionType: string; prev: object; next: object }) {
    if (!this._window || this._window.closed) {
      this._window = this.initializeWindow();
    }

    const {
      diff,
      formatters: {
        html: { format: formatDelta },
      },
    } = await import('jsondiffpatch');

    const delta = diff(prev, next);

    if (delta) {
      this._window!.document.getElementById(
        actionContainerId
      )!.innerText = `Action: "${actionType}"`;
      // eslint-disable-next-line no-unsanitized/property
      this._window!.document.getElementById(diffContainerId)!.innerHTML = formatDelta(delta, null);
    }
  }
}
