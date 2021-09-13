import type { ConnectedEvent } from './connected-event'

import type { ConnectingEvent } from './connecting-event'

import type { DisconnectedEvent } from './disconnected-event'

import type { ReconnectedEvent } from './reconnected-event'

import type { ReconnectingEvent } from './reconnecting-event'

import type { TerminatedEvent } from './terminated-event'

import type { TerminatingEvent } from './terminating-event'

export type LifetimeEvents = {
  connecting: (event: ConnectingEvent) => unknown
  connected: (event: ConnectedEvent) => unknown
  reconnecting: (event: ReconnectingEvent) => unknown
  reconnected: (event: ReconnectedEvent) => unknown
  disconnected: (event: DisconnectedEvent) => unknown
  terminating: (event: TerminatingEvent) => unknown
  terminated: (event: TerminatedEvent) => unknown
}
