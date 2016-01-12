var inherits = require('util').inherits;

var Service, Characteristic;

function LoxoneLightbulb(config, platform, hap) {
    this.log = platform.log;
    this.platform = platform;
    this.loxone = platform.loxone;

    Service = hap.Service;
    Characteristic = hap.Characteristic;

    this.name = config.name;
    this.input = config.input;
    this.output = config.output;

    this._service = new Service.Lightbulb(this.name);
    this._service.getCharacteristic(Characteristic.On)
        .on('get', this._getValue.bind(this));

    this._service.getCharacteristic(Characteristic.On)
        .on('set', this._setValue.bind(this));
}

LoxoneLightbulb.prototype._getValue = function(callback) {
    this.loxone.getValue(this.output, function(value) {
        if (value == undefined) {
            callback(new Error("Could not get value for " + this.input));
            return;
        }
        callback(null, value == '1');
    });
};

LoxoneLightbulb.prototype._setValue = function(on, callback) {
    var loxone = this.loxone;
    var input = this.input;
    var output = this.output;
    loxone.getValue(output, function(value) {
        if (value == undefined) {
            callback(new Error("Could not get value for " + output));
            return;
        }

        var isOn = (value != 0);
        if (isOn != on) {
            loxone.set(input, "Pulse", function(value) {
                if (value == undefined) {
                    callback(new Error("Could not get value for " + input));
                    return;
                }
                callback();
            });
        }

    });
};

LoxoneLightbulb.prototype.getServices = function() {
    return [this._service, this.platform.getInformationService(this)];
};

module.exports = LoxoneLightbulb;