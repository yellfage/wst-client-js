import { IncomingRegularInvocationCompletionMessage } from './incoming-regular-invocation-completion-message'

export type IncomingSuccessRegularInvocationCompletionMessage = IncomingRegularInvocationCompletionMessage & {
  readonly payload: any
}
