/**
 * This is just a bundle of code taken from a react project which will helps with scrolling
 */

/**
 * This goes in App.js
 */

componentDidMount() {

  /**
   * I want to update the scroll values every time we can repaint the browser.
   * RAF is better than scroll because it's patient.
   */

  window.requestAnimationFrame(this.captureScrollValues.bind(this));

}

captureScrollValues () {

  const node = ReactDOM.findDOMNode(document.body); // eslint-disable-line react/no-find-dom-node

  /**
   * Push the scrollTop and scrollHeight into the state, so we can use it in other places
   */

  this.props.dispatch(updateScrollPosition(node.scrollTop));

  this.props.dispatch(updateScrollHeight(node.scrollHeight));

  this.props.dispatch(updateScrollStyle({ transform: `translate3d(0, -${ node.scrollTop }px, 0)` }));

  /**
   * Call the function again (when ready for another paint)
   */

  window.requestAnimationFrame(this.captureScrollValues.bind(this));

}

/**
 * Action
 */

const constants = {
  UPDATE_SCROLL_STYLE: 'UPDATE_SCROLL_STYLE',
};

export function updateScrollStyle(scrollStyle) {
  return {
    type: constants.UPDATE_SCROLL_STYLE,
    scrollStyle
  };
}

/**
 * Reducer
 */

export default function reducer(state, action) {	
  switch (action.type) {
    case constants.UPDATE_SCROLL_STYLE:
      return merge({}, set(state, 'scrollStyle', action.scrollStyle));
  }
}


/**
 * Component Specific
 */

<div style={ this.props.scrollStyle } >
  <h2>News Story Title</h2>
</div>

/**
 * CSS 
 */

div{
	@include transition(0.6s all $easeOutQuint);
}

.main-wrapper{
  position: fixed;
  width: 100%;
  height: 100%;
  top: 250px;
  left: 0;
}