var expect = require('chai').expect
var SearchHelper = require('../helpers/SearchHelper.js')

describe('getName()', function() {
	it('Properly names an .exe file', function() {
		var result = SearchHelper.getName('C:\\Program Files (x86)\\RegexRenamer\\RegexRenamer.exe')
		expect(result).to.equal('RegexRenamer')
	})
	it('Properly names a .lnk file', function() {
		var result = SearchHelper.getName('C:\\Users\\vicve\\Desktop\\Links\\Chrome.lnk')
		expect(result).to.equal('Chrome')
	})
})
