import type { NextApiRequest, NextApiResponse } from 'next'
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Check the secret and next parameters
  // This secret should only be known to this API route and the CMS
  if (req.query.secret !== 'MY_SECRET_TOKEN' || !req.query.slug) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  // Fetch the headless CMS to check if the provided `slug` exists
  // getPostBySlug would implement the required fetching logic to the headless CMS
  // const post = await getPostBySlug(req.query.slug)

  // If the slug doesn't exist prevent draft mode from being enabled
  // if (!post) {
  //   return res.status(401).json({ message: 'Invalid slug' })
  // }

  // Enable Draft Mode by setting the cookie
  // res.setDraftMode({ enable: true })
  res.setPreviewData(
    {},
    {
      maxAge: 60 * 60, // The preview mode cookies expire in 1 hour
      // path: '/about', // The preview mode cookies apply to paths with /about
    }
  )

  // Redirect to the path from the fetched post
  // We don't redirect to req.query.slug as that might lead to open redirect vulnerabilities
  // #goals
  let path = Array.isArray(req.query.slug)
    ? req.query.slug.join('/')
    : req.query.slug
  res.redirect(path.startsWith('/') ? path : '/' + path)
}
