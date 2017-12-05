import styles from '../styles/styles'
import React from 'react';
import {normalizeIndex} from '../util/utils';
class SuggestionList extends React.Component {

  render() {
    const {
      suggestionsState
    } = this.props;
    const {
      left,
      top,
      array,
      selectedIndex
    } = suggestionsState;

    const style = Object.assign({}, styles.suggestions, {
      position: 'absolute',
      left,
      top
    });
    if (!array) {
      return null;
    }
    const normalizedIndex = normalizeIndex(
      selectedIndex, array.length
    );
    return ( < ul style = {style}> {
      array.map((person, index) => {
        const {
          suggestionsState
        } = this.props;
        const style =
          index === normalizedIndex ?
          styles.selectedPerson : styles.person;
        return ( < li key = {
            person
          }
          style = {
            style
          } > {
            person
          } </li>
        );
      }, this)
    } </ul>);
  }
}

export default SuggestionList;