import React from 'react';

export function IconHtml({ html = '' }) {
  return <span dangerouslySetInnerHTML={{ __html: html }} />;
}
