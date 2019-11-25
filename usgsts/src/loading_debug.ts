import {whenLoaded} from './onload';

window.callback = () => {
  console.debug('Callback fired');
};

window.onScriptLoad = () {
  console.debug('onLoad fired');
}

whenLoaded(() => console.log('Loaded!!!'));
