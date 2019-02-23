JavaScript port of Android's [timber](https://github.com/JakeWharton/timber) library.

Behavior is added through Tree instances. You can install an instance by calling Timber.plant. Installation of Trees should be done as early as possible.

## Usage
Two easy steps:

1. Install any Tree instances you want.
2. Call Timber's static methods everywhere.

## Code Demo
### Basic Usage
```javascript
// Plant a tree
Timber.plant(new DebugTree());

// Log without tag
Timber.debug('debug');
Timber.info('info');
Timber.warn('warn');
Timber.error('error');

// Chaining tag with log
Timber.tag('tag-1').debug('debug');
Timber.tag('tag-2').info('info');
Timber.tag('tag-3').warn('warn');
Timber.tag('tag-4').error('error');
```
### Customize Tree
```javascript
class CustomTree extends Tree {

  isLoggable(level, tag) {
    // Log only if level is Warn or Error
    return level >= Level.Warn;
  }

  log(level, tag, message, ...optionalParams) {
    switch (level) {
      case Level.Debug:
        break;
      case Level.Info:
        break;
      case Level.Warn:
        // Report warning...
        break;
      case Level.Error:
        // Report error...
        break;
    }
  }
}

Timber.plant(new CustomTree());
```


## Installation
```
$ npm install @crazyorr/timber
```

## Author
- [CrazyOrr](https://github.com/CrazyOrr)

## License
This project is licensed under the [ISC License](./LICENSE)
