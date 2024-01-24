import JsonEditor from '@/components/json-editor/json-editor';
import { modals } from '@mantine/modals';

interface Props {
  matchResultRow: Record<string, any>;
}

export default function MatchResultRow({ matchResultRow }: Props) {
  return <JsonEditor readOnly={true} content={{ json: matchResultRow }} />;
}

MatchResultRow.open = function openMatchResultRow(props: Props) {
  modals.open({
    size: '75%',
    children: <MatchResultRow {...props} />,
  });
};
