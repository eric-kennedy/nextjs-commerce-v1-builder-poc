import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
// import useAddItem from '@framework/cart/use-add-item'
// import { useAddItem } from '@framework/cart'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/router'
import DefaultErrorPage from 'next/error'
import Head from 'next/head'
import React from 'react'
import {
  BuilderComponent,
  builder,
  useIsPreviewing,
  Builder,
} from '@builder.io/react'
import commerce from '@lib/api/commerce'
import { ProductCard } from '@components/product'
import { WishlistCard } from '@components/wishlist'

/*
  Initialize the Builder SDK with your organization's API Key
  The API Key can be found on: https://builder.io/account/settings
*/
builder.init('9ef67a21535e47fd988bd46f0fed5cc4')

export async function getStaticProps({
  params,
  locale,
  locales,
  preview,
}: GetStaticPropsContext<{ page: [string] }>) {
  /*
    Fetch the first page from Builder that matches the current URL.
    The `userAttributes` field is used for targeting content,
    learn more here: https://www.builder.io/c/docs/targeting-with-builder
  */
  console.log(params)
  const config = { locale, locales }

  const page = await builder
    .get('landing-page', {
      userAttributes: {
        urlPath: '/power/' + (params?.page?.join('/') || ''),
      },
    })
    .toPromise()
  const product = await commerce.getProduct({
    variables: { slug: 'dustpan-brush' },
    config,
    preview,
  })
  console.log('THE product')
  console.log(product)
  return {
    props: {
      page: page || null,
      product: product || null,
    },
    revalidate: 5,
  }
}

export async function getStaticPaths({ locales }: GetStaticPathsContext) {
  /*
    Fetch all published pages for the current model.
    Using the `fields` option will limit the size of the response
    and only return the `data.url` field from the matching pages.
  */
  const pages = await builder.getAll('landing-page', {
    fields: 'data.url', // only request the `data.url` field
    options: { noTargeting: true },
    limit: 0,
  })
  console.log(pages)

  return {
    paths: pages.map((page) => `${page.data?.url}`),
    fallback: true,
  }
}

export default function Page({
  page,
  product,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const router = useRouter()
  // const addItem = useAddItem()
  /*
    This flag indicates if you are viewing the page in the Builder editor.
  */
  const isPreviewing = useIsPreviewing()

  if (router.isFallback) {
    return <h1>Loading...</h1>
  }

  /*
    Add your error page here. This will happen if there are no matching
    content entries published in Builder.
  */
  if (!page && !isPreviewing) {
    return <DefaultErrorPage statusCode={404} />
  }

  // const addToCart = async () => {
  //   await addItem({
  //     productId: String(product?.product?.id ?? 0),
  //     variantId: String(product?.product?.variants[0]?.id ?? 0),
  //   })
  // }
  console.log("here's the product")
  console.log(product)
  return (
    <>
      <Head>
        {/* Add any relevant SEO metadata or open graph tags here */}
        <title>{page?.data.title}</title>
        <meta name="description" content={page?.data.descripton} />
      </Head>
      <div style={{ padding: 50, textAlign: 'center' }}>
        {/* Put your header or main layout here */}
        Your header
      </div>
      <div
        dangerouslySetInnerHTML={{
          __html: page?.data.product.data.data.description,
        }}
      ></div>
      {product && product.product && (
        <>
          <ProductCard
            key={product.product.id}
            product={product.product}
            variant="slim"
          />
          {/* <WishlistCard key={product.product.path} item={product} /> */}
          <button>Add To Cart</button>
        </>
      )}
      {/* Render the Builder page */}
      <BuilderComponent model="page" content={page} />

      <div style={{ padding: 50, textAlign: 'center' }}>
        {/* Put your footer or main layout here */}
        Your footer
      </div>
    </>
  )
}

/*
  This is an example of registering a custom component to be used in Builder.io.
  You would typically do this in the file where the component is defined.
*/

const MyCustomComponent = (props: any) => (
  <div>
    <h1>{props.title}</h1>
    <p>{props.description}</p>
  </div>
)

// const ProductAddToCart = ({ handle }: any) => {
//   const [product, setProduct] = useState<any>({})

//   useEffect(() => {
//     ;(async function () {
//       const productPromise = commerce.getProduct({
//         variables: { slug: handle ?? 'chemex-coffeemaker-3-cup' },
//       })
//       const result = await productPromise

//       setProduct(result)
//     })()
//   }, [handle])

//   return (
//     <div>
//       <h1>{product.title}</h1>
//       <p>{product.description}</p>
//     </div>
//   )
// }

// Builder.registerComponent(ProductAddToCart, {
//   name: 'ProductAddToCart',
//   inputs: [
//     {
//       name: 'product',
//       type: 'BigCommerceProduct',
//     },
//   ],
// })

/*
  This is a simple example of a custom component, you can view more complex input types here:
  https://www.builder.io/c/docs/custom-react-components#input-types
*/
Builder.registerComponent(MyCustomComponent, {
  name: 'ExampleCustomComponent',
  inputs: [
    { name: 'title', type: 'string', defaultValue: 'I am a React component!' },
    {
      name: 'description',
      type: 'string',
      defaultValue: 'Find my source in /pages/[...page].js',
    },
  ],
})

// Register a custom insert menu to organize your custom componnets
// https://www.builder.io/c/docs/custom-components-visual-editor#:~:text=than%20this%20screenshot.-,organizing%20your%20components%20in%20custom%20sections,-You%20can%20create
Builder.register('insertMenu', {
  name: 'My Components',
  items: [{ item: 'ExampleCustomComponent', name: 'My React Component' }],
})
