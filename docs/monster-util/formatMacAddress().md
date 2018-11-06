title: formatMacAddress()

# monster.util.formatMacAddress()

The `formatMacAddress()` method formats a string into a MAC address.

Parses a string representing and returns a MAC object representing the address. A MAC address may be in any of the following forms:

## Syntax
```javascript
monster.util.formatMacAddress(macAddress);
```

### Parameters
Key | Description | Type | Default | Required
:-: | --- | :-: | :-: | :-:
`macAddress` | | `String` | | `true`

### Return value
A new `String` representing a formatted MAC address.

## Description
`formatMacAddress()` trims a string from non-hexadecimal characters

Returns the string representation of the MAC address. An optional options object allows for controlling the output, and takes the following fields:

## Examples
```javascript
monster.util.formatMacAddress('28e0ff974f13');
// output: '28:E0:FF:97:4F:13'

monster.util.formatMacAddress('$28 e0+ff:97-4f_13}');
// output: '28:E0:FF:97:4F:13'

monster.util.formatMacAddress('28e0ss974m13');
// output: ''
```
