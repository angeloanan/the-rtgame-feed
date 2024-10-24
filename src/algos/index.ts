import type { AppContext } from '../config'
import type {
  QueryParams,
  OutputSchema as AlgoOutput,
} from '../lexicon/types/app/bsky/feed/getFeedSkeleton'
import * as theRTGameFeed from './the-rtgame-feed'

type AlgoHandler = (ctx: AppContext, params: QueryParams) => Promise<AlgoOutput>

const algos: Record<string, AlgoHandler> = {
  [theRTGameFeed.shortname]: theRTGameFeed.handler,
}

export default algos
