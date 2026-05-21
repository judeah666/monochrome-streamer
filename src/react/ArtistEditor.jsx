import React from 'react';

export function ArtistEditorBody({
  imageUrl = '',
  bio = '',
  sourceUrl = '',
}) {
  return (
    <div className="tag-editor-body">
      <form className="artist-editor-form">
        <label>
          <span>Artist image URL</span>
          <input id="artist-image-url" type="url" placeholder="https://..." autoComplete="off" defaultValue={imageUrl} />
        </label>
        <label>
          <span>Artist bio / info</span>
          <textarea id="artist-bio" rows="6" placeholder="Write or paste artist info..." defaultValue={bio}></textarea>
        </label>
        <label>
          <span>Source URL</span>
          <input id="artist-source-url" type="url" placeholder="https://..." autoComplete="off" defaultValue={sourceUrl} />
        </label>
      </form>
    </div>
  );
}
