// Static require() map — Metro needs image requires to be literal, so a
// dynamic `require(vehicle.photo)` doesn't work. `vehicle.photo` (set per
// garage bundle in constants/data/state.js) is one of these keys.
const vehiclePhotos = {
  maverick: require('../../assets/vehicles/ford-maverick.png'),
  ranger: require('../../assets/vehicles/ford-ranger.png'),
  mache: require('../../assets/vehicles/ford-mache.png'),
};

export default vehiclePhotos;
