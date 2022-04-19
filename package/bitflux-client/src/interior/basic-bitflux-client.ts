import type { EventEmitter } from '@yellfage/event-emitter'

import type { BitfluxClient } from '../bitflux-client'

import type { EventHandlerMap } from '../event'

import type {
  InvocationHandler,
  NotifiableInvocationBuilder,
  RegularInvocationBuilder,
} from '../invocation'

import type { PluginBuilder } from '../plugin-builder'

import type { State } from '../state'

import type {
  Bridge,
  DisconnectedBridgeEvent,
  ReconnectedBridgeEvent,
  ReconnectingBridgeEvent,
  TerminatedBridgeEvent,
  TerminatingBridgeEvent,
} from './communication'

import type { HandlerMapper } from './handler-mapper'

import type {
  NotifiableInvocationBuilderFactory,
  RegularInvocationBuilderFactory,
} from './invocation'

export class BasicBitfluxClient implements BitfluxClient {
  public get url(): URL {
    return this.bridge.url
  }

  public get state(): State {
    return this.bridge.state
  }

  private readonly bridge: Bridge

  private readonly eventEmitter: EventEmitter<EventHandlerMap>

  private readonly handlerMapper: HandlerMapper

  private readonly regularInvocationBuilderFactory: RegularInvocationBuilderFactory

  private readonly notifiableInvocationBuilderFactory: NotifiableInvocationBuilderFactory

  public constructor(
    bridge: Bridge,
    eventEmitter: EventEmitter<EventHandlerMap>,
    handlerMapper: HandlerMapper,
    regularInvocationBuilderFactory: RegularInvocationBuilderFactory,
    notifiableInvocationBuilderFactory: NotifiableInvocationBuilderFactory,
  ) {
    this.bridge = bridge
    this.eventEmitter = eventEmitter
    this.handlerMapper = handlerMapper
    this.regularInvocationBuilderFactory = regularInvocationBuilderFactory
    this.notifiableInvocationBuilderFactory = notifiableInvocationBuilderFactory

    this.registerBridgeEventHandlers()
  }

  public async connect(url?: string): Promise<void> {
    await this.bridge.connect(url)
  }

  public async disconnect(reason?: string): Promise<void> {
    await this.bridge.disconnect(reason)
  }

  public async terminate(reason?: string): Promise<void> {
    await this.bridge.terminate(reason)
  }

  public use(builder: PluginBuilder): void {
    builder.build().initialize(this)
  }

  public map(handlerName: string, handler: InvocationHandler): void {
    this.handlerMapper.map(handlerName, handler)
  }

  public invoke<TResult>(
    handlerName: string,
  ): RegularInvocationBuilder<TResult> {
    return this.regularInvocationBuilderFactory.create(handlerName)
  }

  public notify(handlerName: string): NotifiableInvocationBuilder {
    return this.notifiableInvocationBuilderFactory.create(handlerName)
  }

  public on<TEventName extends keyof EventHandlerMap>(
    eventName: TEventName,
    handler: EventHandlerMap[TEventName],
  ): EventHandlerMap[TEventName] {
    return this.eventEmitter.on(eventName, handler)
  }

  public off<TEventName extends keyof EventHandlerMap>(
    eventName: TEventName,
    handler: EventHandlerMap[TEventName],
  ): void {
    this.eventEmitter.off(eventName, handler)
  }

  public async emit<TEventName extends keyof EventHandlerMap>(
    eventName: TEventName,
    ...args: Parameters<EventHandlerMap[TEventName]>
  ): Promise<void> {
    await this.eventEmitter.emit(eventName, ...args)
  }

  private registerBridgeEventHandlers(): void {
    this.bridge.on('disconnected', this.handleBridgeDisconnectedEvent)
    this.bridge.on('connecting', this.handleBridgeConnectingEvent)
    this.bridge.on('connected', this.handleBridgeConnectedEvent)
    this.bridge.on('reconnecting', this.handleBridgeReconnectingEvent)
    this.bridge.on('reconnected', this.handleBridgeReconnectedEvent)
    this.bridge.on('terminating', this.handleBridgeTerminatingEvent)
    this.bridge.on('terminated', this.handleBridgeTerminatedEvent)
  }

  private readonly handleBridgeDisconnectedEvent = async ({
    code,
    reason,
  }: DisconnectedBridgeEvent): Promise<void> => {
    await this.eventEmitter.emit('disconnected', { target: this, code, reason })
  }

  private readonly handleBridgeConnectingEvent = async (): Promise<void> => {
    await this.eventEmitter.emit('connecting', { target: this })
  }

  private readonly handleBridgeConnectedEvent = async (): Promise<void> => {
    await this.eventEmitter.emit('connected', {
      target: this,
    })
  }

  private readonly handleBridgeReconnectingEvent = async ({
    attempts,
    delay,
  }: ReconnectingBridgeEvent): Promise<void> => {
    await this.eventEmitter.emit('reconnecting', {
      target: this,
      attempts,
      delay,
    })
  }

  private readonly handleBridgeReconnectedEvent = async ({
    attempts,
  }: ReconnectedBridgeEvent): Promise<void> => {
    await this.eventEmitter.emit('reconnected', {
      target: this,
      attempts,
    })
  }

  private readonly handleBridgeTerminatingEvent = async ({
    reason,
  }: TerminatingBridgeEvent): Promise<void> => {
    await this.eventEmitter.emit('terminating', { target: this, reason })
  }

  private readonly handleBridgeTerminatedEvent = async ({
    reason,
  }: TerminatedBridgeEvent): Promise<void> => {
    await this.eventEmitter.emit('terminated', { target: this, reason })
  }
}
