import m from 'mithril';
import { Peer } from 'peerjs';
import { Game, Server, Client } from '../game';

export default class HomePage {
  constructor() {}

  createRoom() {
    this.server = new Server();
  }

  joinRoom() {
    let id = this.input.dom.value;
    this.client = new Client(id);
  }

  view() {
    return m('div', [
      m('h1', 'Home Page'),
      m('button', { onclick: () => this.createRoom() }, '创建房间'),
      (this.input = m('input', { type: 'text', placeholder: '房间号' })),
      m('button', { onclick: () => this.joinRoom() }, '加入房间'),
      m(
        m.route.Link,
        {
          href: '/game',
        },
        'Game'
      ),
    ]);
  }
}
