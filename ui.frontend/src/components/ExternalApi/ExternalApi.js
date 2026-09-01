import React from 'react';
import { MapTo } from '@adobe/aem-react-editable-components';

const ExternalApi = (props) => {
  if (props.error) {
    return (
      <div style={{ padding: '15px', border: '1px solid red', borderRadius: '4px', color: 'red' }}>
        <p><strong>Erro:</strong> {props.error}</p>
      </div>
    );
  }

  if (!props.post) {
    return (
      <div style={{ padding: '15px', border: '1px dashed #ccc' }}>
        <p>Configure o ID do Post no diálogo do componente.</p>
      </div>
    );
  }

  const { id, title, body, userId } = props.post;

  return (
    <div style={{
      border: '1px solid #e0e0e0',
      borderRadius: '8px',
      padding: '20px',
      margin: '15px 0',
      backgroundColor: '#fff'
    }}>
      <span style={{
        background: '#007bc7',
        color: '#fff',
        padding: '2px 8px',
        borderRadius: '4px',
        fontSize: '12px'
      }}>
        Post #{id} (Autor ID: {userId})
      </span>
      <h2 style={{ marginTop: '10px', textTransform: 'capitalize' }}>{title}</h2>
      <p style={{ color: '#555', lineHeight: '1.5' }}>{body}</p>
    </div>
  );
};

const ExternalApiEditConfig = {
  emptyLabel: 'External API Component',
  isEmpty: function(props) {
    return !props || (!props.post && !props.error);
  }
};

export default MapTo('spaReact/components/externalapi')(
  ExternalApi,
  ExternalApiEditConfig
);