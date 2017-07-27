import pages, {
  MapView,
  Settings
} from './pages';

export const PAGE_PATHS = [
  {
    index: true,
    component: MapView
  },
  {
    path: 'settings',
    component: Settings
  }
];

export const REDUX_ACTIONS = {
  SATELLITES_SET: 'SATELLITES_SET'
};

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZnJhbmtzdmFsbGkiLCJhIjoiSFd2NDgxdyJ9.86RUhUDNQtjWdZysxDIzuw';

export default {
  PAGE_PATHS,
  REDUX_ACTIONS,
  MAPBOX_ACCESS_TOKEN
}