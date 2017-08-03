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
  SATELLITE_SET_BEARING: 'SATELLITE_SET_BEARING',
  SATELLITE_SET_LON_LAT: 'SATELLITE_SET_LON_LAT',
  SATELLITES_SET: 'SATELLITES_SET',
  USER_SET_LON_LAT: 'USER_SET_LON_LAT',
  USER_DENIED_GEOLOCATION: 'USER_DENIED_GEOLOCATION'
};

export const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoiZnJhbmtzdmFsbGkiLCJhIjoiSFd2NDgxdyJ9.86RUhUDNQtjWdZysxDIzuw';

export default {
  PAGE_PATHS,
  REDUX_ACTIONS,
  MAPBOX_ACCESS_TOKEN
}