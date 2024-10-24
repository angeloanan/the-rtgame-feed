import {
  OutputSchema as RepoEvent,
  isCommit,
} from './lexicon/types/com/atproto/sync/subscribeRepos'
import { FirehoseSubscriptionBase, getOpsByType } from './util/subscription'

export class FirehoseSubscription extends FirehoseSubscriptionBase {
  async handleEvent(evt: RepoEvent) {
    if (!isCommit(evt)) return
    const ops = await getOpsByType(evt)

    // // This logs the text of every post off the firehose.
    // // Just for fun :)
    // // Delete before actually using
    // for (const post of ops.posts.creates) {
    //   console.log(post.record.text)
    // }

    const postsToDelete = ops.posts.deletes.map((del) => del.uri)
    const postsToCreate = ops.posts.creates
      .filter((create) => {
        const text = create.record.text.toLowerCase()

        // only rtgame-related posts
        return (
          // RTGame but not ArtGame
          (text.includes('rtgame') && !text.includes('artgame')) ||
          // Drift King
          text.includes('drift king') ||
          // Rumble Tumbl, may be Rumble Tumble or Rumble Tumbling etc
          text.includes('rumble tumbl')
        )
      })
      .filter((post) => {
        const text = post.record.text.toLowerCase()
        return (
          !text.includes('finsub') &&
          !text.includes('goddess') &&
          !text.includes('humanatm') &&
          !text.includes('sissy') &&
          !text.includes('slut') &&
          !text.includes('mistress') &&
          !text.includes('goon') &&
          !text.includes('whore') &&
          !text.includes('dommes') &&
          !text.includes('sex')
        )
      })
      .map((create) => {
        console.log(`${create.author}: ${create.record.text}`)
        // map alf-related posts to a db row
        return {
          uri: create.uri,
          cid: create.cid,
          indexedAt: new Date().toISOString(),
        }
      })

    if (postsToDelete.length > 0) {
      await this.db
        .deleteFrom('post')
        .where('uri', 'in', postsToDelete)
        .execute()
    }
    if (postsToCreate.length > 0) {
      await this.db
        .insertInto('post')
        .values(postsToCreate)
        .onConflict((oc) => oc.doNothing())
        .execute()
    }
  }
}
