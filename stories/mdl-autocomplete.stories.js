import { storiesOf, html, withKnobs, withClassPropertiesKnobs } from '@open-wc/demoing-storybook';

import {MdlAutocomplete} from '../src/mdl-autocomplete/index.js';

import readme from '../src/mdl-autocomplete/README.md';

storiesOf('lit-mdl', module)
  .addDecorator(withKnobs)
  .add('Documentation', () => withClassPropertiesKnobs(MdlAutocomplete), { notes: { markdown: readme } })
  .add(
    'MDL Autocomplete',
    () => html`
      <mdl-autocomplete></mdl-autocomplete>
    `,
  );
