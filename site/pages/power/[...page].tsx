import type {
  GetStaticPathsContext,
  GetStaticPropsContext,
  InferGetStaticPropsType,
} from 'next'
// import useAddItem from '@framework/cart/use-add-item'
// import { useAddItem } from '@framework/cart'
// import { useEffect, useState } from 'react'
import { useUI } from '@components/ui/context'
import { useRouter } from 'next/router'
import { Sidebar } from '@components/ui'
import CartSidebarView from '@components/cart/CartSidebarView'
import PaymentMethodView from '@components/checkout/PaymentMethodView'
import CheckoutSidebarView from '@components/checkout/CheckoutSidebarView'
import ShippingView from '@components/checkout/ShippingView'
import { MenuSidebarView } from '@components/common/UserNav'
import { CommerceProvider } from '@framework'
import { CheckoutProvider } from '@components/checkout/context'
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
import type { Link as LinkProps } from '../../components/common/UserNav/MenuSidebarView'

/*
  Initialize the Builder SDK with your organization's API Key
  The API Key can be found on: https://builder.io/account/settings
*/
const API_KEY = '9ef67a21535e47fd988bd46f0fed5cc4'
builder.init(API_KEY)
builder.apiVersion = 'v3'

export async function getServerSideProps({
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
  console.log('preview')
  console.log(preview)
  let urlPath = '/power/' + (params?.page?.join('/') || '')
  console.log(urlPath)
  const results = await fetch(
    `https://cdn.builder.io/api/v3/content/landing-page?apiKey=${API_KEY}&userAttributes.urlPath=${urlPath}&cachebust=true&preview=landing-page&noCache=true&includeUnpublished=true&includeRefs=true`
  ).then((res) => res.json())
  console.log('Builder Response')
  console.log(results)
  const page = results?.results?.[0]
  // const page = await builder
  //   .get('landing-page', {
  //     userAttributes: {
  //       urlPath:
  //     },
  //     // preview: preview,
  //   })
  //   .toPromise()
  // console.log('Builder Response')
  // console.log(page)
  console.log('product ID')
  console.log(page?.data?.product?.data?.data?.id)
  console.log('slug')
  console.log(page?.data?.product?.data?.data?.custom_url?.url)
  let product = null
  if (page?.data?.product?.data?.data?.id) {
    const graphqlData = await commerce.getAllProducts({
      variables: { first: 1, ids: [page.data.product.data.data.id] },
      config,
    })
    console.log('Found ' + (graphqlData?.products?.length ?? 0) + ' products')
    if (graphqlData.products && graphqlData.products.length === 1) {
      product = graphqlData.products[0]
    }
  }
  // const product = await commerce.getProduct({
  //   variables: { slug: 'dustpan-brush' },
  //   config,
  //   preview,
  // })
  console.log('THE product')
  console.log(product)
  return {
    props: {
      page: page || null,
      product: product || null,
    },
    // revalidate: 1,
  }
}

// export async function getStaticPaths({ locales }: GetStaticPathsContext) {
//   /*
//     Fetch all published pages for the current model.
//     Using the `fields` option will limit the size of the response
//     and only return the `data.url` field from the matching pages.
//   */
//   const pages = await builder.getAll('landing-page', {
//     fields: 'data.url', // only request the `data.url` field
//     options: { noTargeting: true },
//     limit: 0,
//   })
//   console.log(pages)

//   return {
//     paths: pages
//       .map((page) => `${page.data?.url}`)
//       .filter((url) => url !== '/'),
//     fallback: 'blocking',
//   }
// }

export default function Page({ page, product }: any) {
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
  //     productId: String(product?.id ?? 0),
  //     variantId: String(product?.variants[0]?.id ?? 0),
  //   })
  // }

  console.log("here's the BC product")
  console.log(product)
  return (
    <>
      <Head>
        {/* Add any relevant SEO metadata or open graph tags here */}
        <title>{page?.data.title}</title>
        <meta name="description" content={page?.data.descripton} />
      </Head>
      <CommerceProvider locale={router.locale ?? 'en-US'}>
        <div style={{ padding: 50, textAlign: 'center' }}>
          {/* Put your header or main layout here */}
          Your header
        </div>
        <div
          dangerouslySetInnerHTML={{
            __html: page?.data?.product?.data?.data?.description,
          }}
        ></div>
        {product && (
          <>
            {/* <ProductCard key={product.id} product={product} variant="slim" /> */}
            <WishlistCard
              key={product.path}
              item={{
                id: '1234',
                productId: '',
                variantId: '',
                product: product,
              }}
            />
            {/* <button onClick={addToCart}>Add To Cart</button> */}
          </>
        )}
        <CheckoutProvider>
          <SidebarUI links={[]} />
        </CheckoutProvider>

        {/* Render the Builder page */}
        <BuilderComponent model="page" content={page || undefined} />
      </CommerceProvider>
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

const SidebarView: React.FC<{
  sidebarView: string
  closeSidebar(): any
  links: LinkProps[]
}> = ({ sidebarView, closeSidebar, links }) => {
  return (
    <Sidebar onClose={closeSidebar}>
      {sidebarView === 'CART_VIEW' && <CartSidebarView />}
      {sidebarView === 'SHIPPING_VIEW' && <ShippingView />}
      {sidebarView === 'PAYMENT_VIEW' && <PaymentMethodView />}
      {sidebarView === 'CHECKOUT_VIEW' && <CheckoutSidebarView />}
      {sidebarView === 'MOBILE_MENU_VIEW' && <MenuSidebarView links={links} />}
    </Sidebar>
  )
}

const SidebarUI: React.FC<{ links: LinkProps[] }> = ({ links }) => {
  const { displaySidebar, closeSidebar, sidebarView } = useUI()
  return displaySidebar ? (
    <SidebarView
      links={links}
      sidebarView={sidebarView}
      closeSidebar={closeSidebar}
    />
  ) : null
}
