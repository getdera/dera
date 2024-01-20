import { useEffect, useRef } from 'react';
import { JSONEditor, JSONEditorPropsOptional } from 'vanilla-jsoneditor';

const JsonEditor = (props: JSONEditorPropsOptional) => {
  const refContainer = useRef<HTMLDivElement>(null);
  const refEditor = useRef<JSONEditor | null>(null);

  useEffect(() => {
    refEditor.current = new JSONEditor({
      target: refContainer.current!,
      props: {},
    });

    return () => {
      // destroy editor
      if (refEditor.current) {
        refEditor.current.destroy();
        refEditor.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (refEditor.current) {
      refEditor.current.updateProps(props);
    }
  }, [props]);

  return <div ref={refContainer} className="jse-theme-dark"></div>;
};

export default JsonEditor;
