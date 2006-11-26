/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is Auto Live Titles.
 *
 * The Initial Developer of the Original Code is
 *      Dave Townsend <dave.townsend@blueprintit.co.uk>.
 *
 * Portions created by the Initial Developer are Copyright (C) 2006
 * the Initial Developer. All Rights Reserved.
 *
 * Contributor(s):
 *      Steve England
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 *
 * ***** END LICENSE BLOCK *****
 *
 * $HeadURL$
 * $LastChangedBy$
 * $Date$
 * $Revision$
 *
 */

const NS_LT = "http://www.mozilla.org/microsummaries/0.1";
const NS_XSLT = "http://www.w3.org/1999/XSL/Transform";

var AutoLiveTitles = {
	range: null,
	window: null,
	
	init: function()
	{
		this.range = window.arguments[0].range;
		this.window = window.arguments[0].window;
		
		var node = this.range.commonAncestorContainer;
		var box = document.getElementById("txt_xpath");
		box.value = this.generateXPath(node, null);
		this.evaluateXPath();
		
		document.documentElement.getButton("extra1").addEventListener("click", this, false);
	},
	
	generateXPath: function(target, context)
	{
		if (context == null)
			context = target.ownerDocument;
		
		kwds = [];
		kwds["showClass"] = false;
		kwds["showId"] = true;
		kwds["showNS"] = false;
		kwds["toLowercase"] = true;
		return generateXPath(target, context, null, kwds)
	},
	
	evaluateXPath: function()
	{
		var box = document.getElementById("txt_xpath");
		var text = document.getElementById("txt_prefix").value;
		try
		{
			var results = this.window.document.evaluate(box.value, this.window.document, null, XPathResult.ANY_TYPE, null);
			var node = results.iterateNext();
			while (node)
			{
				text += node.textContent;
				node = results.iterateNext();
			}
		}
		catch (e) { }
		text += document.getElementById("txt_suffix").value;
		document.getElementById("desc_results").value = text;
	},
	
	createMicrosummaryXML: function()
	{
		var doc = document.implementation.createDocument(NS_LT, "generator", null);
		doc.documentElement.setAttribute("name", document.getElementById("txt_name").value);
		
		var template = doc.createElementNS(NS_LT, "template");
		doc.documentElement.appendChild(template);

		var transform = doc.createElementNS(NS_XSLT, "transform");
		transform.setAttribute("version", "1.0");
		template.appendChild(transform);

		var output = doc.createElementNS(NS_XSLT, "output");
		output.setAttribute("method", "text");
		transform.appendChild(output);
		
		template = doc.createElementNS(NS_XSLT, "template");
		template.setAttribute("match", "/");
		transform.appendChild(template);
		
		var text = doc.createElementNS(NS_XSLT, "text");
		text.appendChild(doc.createTextNode(document.getElementById("txt_prefix").value));
		template.appendChild(text);
		
		var valueof = doc.createElementNS(NS_XSLT, "value-of");
		valueof.setAttribute("select", document.getElementById("txt_xpath").value);
		template.appendChild(valueof);
		
		text = doc.createElementNS(NS_XSLT, "text");
		text.appendChild(doc.createTextNode(document.getElementById("txt_suffix").value));
		template.appendChild(text);
		
		var pages = doc.createElementNS(NS_LT, "pages");
		doc.documentElement.appendChild(pages);
		
		var include = doc.createElementNS(NS_LT, "include");
		switch (document.getElementById("radio_pages").selectedItem.value)
		{
			case "0":
				include.appendChild(doc.createTextNode(this.window.location.protocol+"//"+this.window.location.host+"/.*"));
				break;
			case "1":
				var loc = this.window.location.href;
				if (this.window.location.hash.length>0)
					loc = loc.substring(0, loc.length-this.window.location.hash.length);
				include.appendChild(doc.createTextNode(loc));
				break;
		}
		pages.appendChild(include);
		
		var update = doc.createElementNS(NS_LT, "update");
		update.setAttribute("interval", document.getElementById("radio_update").selectedItem.value);
		
		doc.documentElement.appendChild(update);
		return doc;
	},
	
	accept: function()
	{
		var ms = Components.classes["@mozilla.org/microsummary/service;1"]
		                   .getService(Components.interfaces.nsIMicrosummaryService);
		ms.installGenerator(this.createMicrosummaryXML());
	},
	
	save: function()
	{
		var bundle = document.getElementById("bundle");
		
		var fp = Components.classes["@mozilla.org/filepicker;1"]
		                   .createInstance(Components.interfaces.nsIFilePicker);
		fp.init(window, bundle.getString("autolivetitle.filepicker.title"), fp.modeSave);
		fp.defaultString="microsummary.xml";

		var result = fp.show();
		if (result==fp.returnOK || result==fp.returnReplace)
		{
			var data = this.createMicrosummaryXML();
			var file = fp.file;
			var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
			                         .createInstance(Components.interfaces.nsIFileOutputStream);
			
			foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // write, create, truncate
			var serializer = new XMLSerializer();
			serializer.serializeToStream(data, foStream, "UTF-8");
			foStream.write(data, data.length);
			foStream.close();
		}
	},
	
	handleEvent: function(event)
	{
		switch (event.type)
		{
			case "load":
				window.removeEventListener("load", this, false);
				this.init();
				break;
			case "click":
				this.save();
				break;
		}
	}
};

window.addEventListener("load", AutoLiveTitles, false);
