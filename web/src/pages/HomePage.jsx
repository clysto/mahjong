import m from 'mithril';
import ConnectDialog from '../components/ConnectDialog.jsx';

const { Link } = m.route;

export default class HomePage {
  constructor() {}

  view() {
    return (
      <div>
        <ConnectDialog></ConnectDialog>
      </div>
    );
  }
}
