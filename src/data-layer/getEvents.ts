import 'server-only';

import { gql } from 'graphql-request';
import { cache } from 'react';

import type { AllEventsQuery } from './__generated__';
import { datoClient } from './client';
import type { FullstackEvent, Lecturer } from './domain';

const query = gql`
  query AllEvents {
    allEvents {
      slug
      title {
        blocks
        links
        value
      }
      thumbnail {
        url
        alt
        size
        width
        height
      }
      startDate
      lecturers {
        slug
        name
        avatar {
          url
          alt
          size
          width
          height
        }
      }
    }
  }
`;

const toLecturer = (
  l: AllEventsQuery['allEvents'][number]['lecturers'][number],
): Lecturer => ({
  name: l.name!,
  avatar: {
    src: l.avatar!.url,
    alt: l.avatar!.alt ?? `${l.name!}'s avatar`,
  },
});

const toFullstacksJSEvent = (
  ev: AllEventsQuery['allEvents'][number],
): FullstackEvent => {
  return {
    slug: ev.slug!,
    title: ev.title,
    thumbnail: {
      alt: ev.thumbnail!.alt ?? `${ev.slug!}'s thumbnail`,
      src: ev.thumbnail!.url,
    },
    lecturers: ev.lecturers.map(toLecturer),
    date: ev.startDate,
  };
};

export const getEvents = cache(async (): Promise<FullstackEvent[]> => {
  const data = await datoClient.request<AllEventsQuery>(query);
  return data.allEvents.map(toFullstacksJSEvent);
});
