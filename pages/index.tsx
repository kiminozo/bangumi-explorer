import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { GetStaticProps, GetStaticPaths, GetServerSideProps } from 'next'

import absoluteUrl from 'next-absolute-url'

import { Grid, Input, Item, Container, Icon, Card, Image, Segment, Label, Header, Rating, Button } from 'semantic-ui-react';

import 'semantic-ui-css/semantic.min.css'
import { StoreItem } from '../service/store';
import { login_url } from "../service/bangumi";

interface Result {
  items: StoreItem[]
}

async function search(key: string, updateItem: (items: StoreItem[]) => void) {
  if (!key || key === '') {
    updateItem([]);
    return;
  }
  const response = await fetch("/anime/" + key);
  const data: Result = await response.json();
  const items = data.items;
  if (items) {
    updateItem(items);
  }
}


const ItemsGroup = (props: { items: StoreItem[] }) => {
  const { items } = props;
  return (<Grid relaxed columns={6}>
    {
      items.map(item => (
        <Grid.Column>
          <>
            <Image wrapped rounded src={`/images/${item.id}`} size='small'
              label={{ as: 'a', color: 'blue', corner: 'right', icon: 'heart' }}
            />
            <Header as="div" size="small"
              content={item.name_cn ?? item.name}
              subheader={item.air_date}
            />
            <Rating icon='star' defaultRating={Math.floor((item.rating.score + 0.5) / 2)} maxRating={5} />
          </>
        </Grid.Column>
      ))
    }
  </Grid>)
}

// const searchHandle = async (query: string) => {
//   const [items, setItems] = useState<StoreItem[]>([]);
//   if (!query || query === '') {
//     setItems([]);
//     return;
//   }
//   const response = await fetch("/anime/" + key);
//   const data: Result = await response.json();
//   const newItems = data.items;
//   if (newItems) {
//     setItems(newItems);
//   }
//   return items;
// }


export const getServerSideProps: GetServerSideProps = async (context) => {
  const { origin } = absoluteUrl(context.req);
  return {
    props: { domain: origin }
  };
}

const Home = (props: { domain: string }) => {
  const { domain } = props;
  const [items, setItems] = useState<StoreItem[]>([]);
  //const [loading, setLoading] = useState<boolean>(false);
  return (
    <>
      <Head>
        <title>title</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
      </Head>
      <Container>
        <Grid>
          <Grid.Row>
            <Link href={login_url(`${domain}/callback`)}>
              <Button>
                登录
              </Button>
            </Link>
          </Grid.Row>
          <Grid.Row centered>
            <Grid.Column width={10} >
              <Input fluid icon='search' placeholder='Search...'
                onChange={(data) => search(data.target.value, setItems)} />
            </Grid.Column>
          </Grid.Row>
          <Grid.Row>
            <ItemsGroup items={items} />
          </Grid.Row>
        </Grid >
      </Container>
    </>
  )
}

export default Home
