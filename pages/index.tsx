import React, { useState } from 'react'
import Head from 'next/head'
import Link from 'next/link'
import { Grid, Input, Item, Container, Icon } from 'semantic-ui-react';
import _ from 'lodash'

import 'semantic-ui-css/semantic.min.css'
import { StoreItem } from '../service/store';

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
  return (<Item.Group divided>
    {
      items.map(item => (
        <Item>
          {/* <Item.Image size='tiny' src={item.images.medium} /> */}
          <Item.Image size='tiny' src={`/images/${item.id}`} />
          <Item.Content>
            <Item.Header>{item.name_cn}</Item.Header>
            <Item.Meta>
              <span >{item.name}</span>
              <span >{item.air_date}</span>
            </Item.Meta>
            <Item.Description>{item.summary}</Item.Description>
            <Item.Extra>
              <Icon name='file' /> {item.path}
            </Item.Extra>
          </Item.Content>

        </Item>
      ))
    }
  </Item.Group>)
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


const Home = () => {
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
          <Grid.Row centered>
            <Input icon='search' placeholder='Search...'
              onChange={(data) => search(data.target.value, setItems)} />
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
