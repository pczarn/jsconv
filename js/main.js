String.prototype.repeat = function( num )
{
	for( var i = 0, buf = ""; i < num; i++ ) buf += this;
	return buf;
}

String.prototype.ljust = function(width, padding)
{
	padding = padding || " ";
	padding = padding.substr( 0, 1 );
	if( this.length < width )
		return this + padding.repeat( width - this.length );
	else
		return this;
}

String.prototype.rjust = function( width, padding ) {
	padding = padding || " ";
	padding = padding.substr( 0, 1 );
	if( this.length < width )
		return padding.repeat( width - this.length ) + this;
	else
		return this;
}

function checkedValue(name)
{
	var el = document.getElementsByName(name);
	for(var i=0; i<el.length; i++)
		if(el[i].checked)
			return el[i].value;
}

//#######################################

function get_str(str)
{
	var len = str.length;
	var arr = new Uint8Array(len);
	
	for(var i=0; i<len; i++)
		arr[i] = str.charCodeAt(i);
	
	return arr;
}

function get_ascii()
{
	return get_str($('#ascii').val());
}

function get_bin()
{
	var val = $('#bin').val();
	var len = val.length;
	var arr = new Uint8Array(Math.ceil(len/8));

	$('#bin')[0].style.background = null;

	if(len % 8) {
		val = "0000000".substr(0, 8 - len%8) + val;
		len = val.length;
	}

	for(var i=0; i<len/8; i++) {
		var v = arr[i] = parseInt(val.substr(i*8, 8), 2);

		if(isNaN(v)) {
			return;
		}
	}

	return arr;
}

function get_hex()
{
	var val = $('#hex').val();
	var len = val.length;
	var arr = new Uint8Array(Math.ceil(len/2));

	if(len % 2) {
		val += "0";
		len++;
	}

	for(var i=0; i<len/2; i++) {
		var v = arr[i] = parseInt(val.substr(i*2, 2), 16);
		
		if(isNaN(v)) {
			return;
		}
	}

	return arr;
}

function get_dec()
{
	var val = $('#dec').val();
	var bignum = parseFloat(val);
	var len = Math.ceil(Math.log(bignum) / Math.log(256));

	if(len == -Infinity || val.length == 0)
		len = bignum = 0;

	if(isNaN(bignum) || len == Infinity) {
		return;
	}

	var arr = new Uint8Array(len);

	for(var i=0; i<len; i++) {
		arr[i] = bignum % 256;
		bignum /= 256.0;
	}

	return arr;
}

function get_base64()
{
  var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
  var o1, o2, o3, h1, h2, h3, h4, bits, i = 0,
    ac = 0,
    dec = "",
    tmp_arr = [];

    data = $('#base64').val();
  if (!data) {
    return data;
  }

  data += '';

  do { // unpack four hexets into three octets using index points in b64
    h1 = b64.indexOf(data.charAt(i++));
    h2 = b64.indexOf(data.charAt(i++));
    h3 = b64.indexOf(data.charAt(i++));
    h4 = b64.indexOf(data.charAt(i++));

    bits = h1 << 18 | h2 << 12 | h3 << 6 | h4;

    o1 = bits >> 16 & 0xff;
    o2 = bits >> 8 & 0xff;
    o3 = bits & 0xff;

    if (h3 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1);
    } else if (h4 == 64) {
      tmp_arr[ac++] = String.fromCharCode(o1, o2);
    } else {
      tmp_arr[ac++] = String.fromCharCode(o1, o2, o3);
    }
  } while (i < data.length);

  dec = tmp_arr.join('');
  return get_str(dec);
}

function get_urlenc()
{
	try {
		var uri = decodeURIComponent($('#urlenc').val().replace(/\+/g, " "));
		return get_str(uri);
	}
	catch(e) {
		return;
	}
}

function get_ent()
{
	var ent = $('#ent').val().replace(/</g, '&lt;').replace(/>/g, '&gt;');
	return get_str($('<div/>').html(ent).text());
}

//#######################################

function update_adler32()
{
	var hash = adler32($('#ascii').val());
	switch(checkedValue('adler32')) {
		case 'hex':
			hash = hash.toString(16);
		break;
		case 'bin':
			hash = hash.toString(2);
		break;
	}
	$('#adler32').val(hash);
}

function update_sha()
{
	var types = [1, 224, 256, 384, 512];
	var sha = new jsSHA($('#ascii').val(), "ASCII");

	for(i in types) {
		$('#sha' + types[i]).val(sha.getHash("SHA-" + types[i], "HEX"));
	}
}

//#######################################

function convert(obj)
{
	var get = {
		'ascii': get_ascii,
		'dec': get_dec,
		'hex': get_hex,
		'bin': get_bin,
		'base64': get_base64,
		'urlenc': get_urlenc,
		'ent': get_ent
	};
	var a;

	if(obj.constructor == Array)
		a = obj;
	else
		a = get[obj.id].call();

	if(!a) {
		$('#' + obj.id).addClass('err');
		return;
	}

	$('.err').removeClass('err');

	if(obj.id != 'ascii') {
		var s = '';
		for(var i=0; i<a.length; i++)
			s += String.fromCharCode(a[i]);
		
		$('#ascii').val(s);
	}
	if(obj.id != 'bin') {
		var s = '';
		for(var i=0; i<a.length; i++)
			s += a[i].toString(2).rjust(8, '0');
		
		$('#bin').val(s);
	}
	if(obj.id != 'hex') {
		var s = '';
		for(var i=0; i<a.length; i++)
			s += a[i].toString(16).ljust(2, '0');
		
		$('#hex').val(s);
	}
	if(obj.id != 'dec') {
		var bignum = 0, mul = 1;
		
		for(var i=0; i<a.length; i++) {
			bignum += a[i] * mul;
			mul *= 256;
		}
		
		$('#dec').val(bignum).css('background', isFinite(bignum) ? '' : 'red');
	}
	if(obj.id != 'base64') {
		var b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
		var o1, o2, o3, bits, h1, h2, h3, h4, e=[], pad = '', c, plain, coded;
		c = a.length % 3;		// pad string to length of multiple of 3
		if (c > 0) { while (c++ < 3) { pad += '='; } }
		   
		for (c=0; c<a.length; c+=3)
		{
			o1 = a[c];
			o2 = a[c+1];
			o3 = a[c+2];
			  
			bits = o1<<16 | o2<<8 | o3;
			  
			h1 = bits>>18 & 0x3f;
			h2 = bits>>12 & 0x3f;
			h3 = bits>>6 & 0x3f;
			h4 = bits & 0x3f;

			// use hextets to index into code string
			e[c/3] = b64.charAt(h1) + b64.charAt(h2) + b64.charAt(h3) + b64.charAt(h4);
		}
		coded = e.join('');		// join() is far faster than repeated string concatenation in IE
		  
		// replace 'A's from padded nulls with '='s
		$('#base64').val(coded.slice(0, coded.length-pad.length) + pad);
	}
	if(obj.id != 'urlenc') {
		var s = '';
		for(var i=0; i<a.length; i++)
			s += String.fromCharCode(a[i]);

		$('#urlenc').val(encodeURIComponent(s).replace(/'/g,"%27").replace(/"/g,"%22"));
	}
	if(obj.id != 'ent') {
		var ent = '';
		
		for(var i=0; i<a.length; i++)
			ent += "&#" + a[i] + ";";
		
		$('#ent').val(ent);
		
		var s = '';
		for(var i=0; i<a.length; i++)
			s += String.fromCharCode(a[i]);
		
		$('#ent').val($('<div/>').text(s).html());
	}
	
	update_sha();
	update_adler32();
}

$(function() {
	content = {};

	$('#ascii, #bin, #hex, #dec, #base64, #urlenc, #ent').bind(
		'change keyup input',
		function() {
			if(this.value !== content[this.id]) {
				content[this.id] = this.value;
				convert(this);
			}
		}
	);
});