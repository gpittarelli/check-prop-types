const test = require('tape');
const PropTypes = require('prop-types');
const checkPropTypes = require('.');

test('Good props check falsy', function(assert) {
  assert.plan(2);
  assert.ifError(checkPropTypes({}, {}, 'prop'));
  assert.ifError(checkPropTypes({x: PropTypes.number}, {x: 1}, 'prop'));
});

test('Specifically, good props check undefined (#1)', function(assert) {
  assert.plan(3);
  assert.is(checkPropTypes({}, {}, 'prop'),
    undefined);
  assert.is(checkPropTypes({x: PropTypes.number}, {x: 1}, 'prop'),
    undefined);
  assert.isNot(checkPropTypes({}, {}, 'prop'),
    null);
});

test('Bad props return a message', function(assert) {
  assert.plan(1);
  var message = checkPropTypes({x: PropTypes.number}, {x: ''}, 'prop', 'C');
  assert.deepEqual(message, ['Failed prop type: Invalid prop `x` of type `string` supplied to `C`, expected `number`.']);
});

test('Bad propTypes fail check', function(assert) {
  assert.plan(2);
  var message;

  message = checkPropTypes({x: null}, {}, 'prop', 'C');
  assert.deepEqual(message, ['C: prop type `x` is invalid; it must be a function, usually from React.PropTypes.']);

  message = checkPropTypes({x: function() {return 1}}, {}, 'prop', 'C');
  assert.deepEqual(message, ['C: type specification of prop `x` is invalid; the type checker function must return `null` or an `Error` but returned a number. You may have forgotten to pass an argument to the type checker creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and shape all require an argument).']);
});

test('Multiple propType errors', function(assert) {
  assert.plan(2);
  var message;

  messages = checkPropTypes(
    {x: PropTypes.number.isRequired, y: PropTypes.number.isRequired},
    {},
    'prop',
    'C'
  );
  assert.deepEqual(messages, [
    'Failed prop type: The prop `x` is marked as required in `C`, but its value is `undefined`.',
    'Failed prop type: The prop `y` is marked as required in `C`, but its value is `undefined`.'
  ]);

  // Nested proptype shapes
  messages = checkPropTypes(
    {x: PropTypes.number.isRequired,
     o: PropTypes.shape({
       y: PropTypes.number.isRequired,
       z: PropTypes.number.isRequired
     }).isRequired},
    {o:{}},
    'prop',
    'C'
  );
  assert.deepEqual(messages, [
    'Failed prop type: The prop `x` is marked as required in `C`, but its value is `undefined`.',
    'Failed prop type: The prop `o.y` is marked as required in `C`, but its value is `undefined`.'
    // Ugh! would like to get an error for o.z as well here... but prop-types won't tell us :(
  ]);
});

test('Throwing propTypes fail check', function(assert) {
  assert.plan(1);
  function throwingType() {
    throw new Error('sup');
  }
  var message = checkPropTypes({x: throwingType}, {}, 'prop', 'C');
  assert.deepEqual(message, ['Failed prop type: sup']);
});

test('Does not avoid failing the same problem multiple times', function(assert) {
  assert.plan(2);
  assert.true(checkPropTypes({x: PropTypes.string}, {x: 1}, 'prop'));
  assert.true(checkPropTypes({x: PropTypes.string}, {x: 1}, 'prop'));
});

test('assertPropTypes throws instead of returning error', function(assert) {
  var assertPropTypes = checkPropTypes.assertPropTypes;
  assert.plan(2);

  assert.doesNotThrow(function() {
    assertPropTypes({x: PropTypes.number}, {x: 1}, 'prop', 'c');
  });

  assert.throws(function() {
    assertPropTypes({x: PropTypes.number}, {x: ''}, 'prop', 'c');
  });
});
