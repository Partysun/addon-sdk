var prefs = require("preferences-service");
var {Cc,Ci} = require("chrome");

exports.testReset = function(test) {
  prefs.reset("test_reset_pref");
  test.assertEqual(prefs.has("test_reset_pref"), false);
  test.assertEqual(prefs.isSet("test_reset_pref"), false);
  prefs.set("test_reset_pref", 5);
  test.assertEqual(prefs.has("test_reset_pref"), true);
  test.assertEqual(prefs.isSet("test_reset_pref"), true);
};

exports.testGetAndSet = function(test) {
  let svc = Cc["@mozilla.org/preferences-service;1"].
            getService(Ci.nsIPrefService).
            getBranch(null);
  svc.setCharPref("test_get_string_pref", "a normal string");
  test.assertEqual(prefs.get("test_get_string_pref"), "a normal string",
                   "preferences-service should read from " +
                   "application-wide preferences service");

  prefs.set("test_set_get_pref.integer", 1);
  test.assertEqual(prefs.get("test_set_get_pref.integer"), 1,
                   "set/get integer preference should work");

  prefs.set("test_set_get_number_pref", 42);
  test.assertRaises(
    function() { prefs.set("test_set_get_number_pref", 3.14159); },
    "cannot store non-integer number: 3.14159",
    "setting a float preference should raise an error"
  );
  test.assertEqual(prefs.get("test_set_get_number_pref"), 42,
                   "bad-type write attempt should not overwrite");

  // 0x80000000 (no), 0x7fffffff (yes), -0x80000000 (yes), -0x80000001 (no)
  test.assertRaises(
    function() { prefs.set("test_set_get_number_pref", Math.pow(2, 31)); },
    ("you cannot set the test_set_get_number_pref pref to the number " +
     "2147483648, as number pref values must be in the signed 32-bit " +
     "integer range -(2^31) to 2^31-1.  To store numbers outside that " +
     "range, store them as strings."),
    "setting an int pref outside the range -(2^31) to 2^31-1 shouldn't work"
  );
  test.assertEqual(prefs.get("test_set_get_number_pref"), 42,
                   "out-of-range write attempt should not overwrite 1");
  prefs.set("test_set_get_number_pref", Math.pow(2, 31)-1);
  test.assertEqual(prefs.get("test_set_get_number_pref"), 0x7fffffff,
                   "in-range write attempt should work 1");
  prefs.set("test_set_get_number_pref", -Math.pow(2, 31));
  test.assertEqual(prefs.get("test_set_get_number_pref"), -0x80000000,
                   "in-range write attempt should work 2");
  test.assertRaises(
    function() { prefs.set("test_set_get_number_pref", -0x80000001); },
    ("you cannot set the test_set_get_number_pref pref to the number " +
     "-2147483649, as number pref values must be in the signed 32-bit " +
     "integer range -(2^31) to 2^31-1.  To store numbers outside that " +
     "range, store them as strings."),
    "setting an int pref outside the range -(2^31) to 2^31-1 shouldn't work"
  );
  test.assertEqual(prefs.get("test_set_get_number_pref"), -0x80000000,
                   "out-of-range write attempt should not overwrite 2");


  prefs.set("test_set_get_pref.string", "foo");
  test.assertEqual(prefs.get("test_set_get_pref.string"), "foo",
                   "set/get string preference should work");

  prefs.set("test_set_get_pref.boolean", true);
  test.assertEqual(prefs.get("test_set_get_pref.boolean"), true,
                   "set/get boolean preference should work");

  prefs.set("test_set_get_unicode_pref", String.fromCharCode(960));
  test.assertEqual(prefs.get("test_set_get_unicode_pref"),
                   String.fromCharCode(960),
                   "set/get unicode preference should work");

  var unsupportedValues = [null, [], undefined];
  unsupportedValues.forEach(
    function(value) {
      test.assertRaises(
        function() { prefs.set("test_set_pref", value); },
        ("can't set pref test_set_pref to value '" + value + "'; " +
         "it isn't a string, integer, or boolean"),
        "Setting a pref to " + uneval(value) + " should raise error"
      );
    });
};
