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

var AutoLiveTitleController = {
	updateCommands: function()
	{
		var commands = ["cmd_autolivetitlecreate"];
		
		for (var i=0; i<commands.length; i++)
			goUpdateCommand(commands[i]);
	},
	
	supportsCommand: function (command)
	{
		switch (command)
		{
			case "cmd_autolivetitlecreate":
				return true;
			default:
				return false;
		}
	},
	
	isCommandEnabled: function (command)
	{
		var focuswin = document.commandDispatcher.focusedWindow;
		var hasFocus = false;
		if (focuswin)
		{
			var selection = focuswin.getSelection();
			hasFocus = !selection.isCollapsed;
		}
		
		switch (command)
		{
			case "cmd_autolivetitlecreate":
				return hasFocus;
			default:
				return false;
		}
	},
	
	doCommand: function (command)
	{
		switch (command)
		{
			case "cmd_autolivetitlecreate":
				var args = {};
				args.window = document.commandDispatcher.focusedWindow;
				args.range = document.commandDispatcher.focusedWindow.getSelection().getRangeAt(0);
				window.openDialog("chrome://autolivetitle/content/xpathCreator.xul", "XPath Creator", "centerscreen,modal,dialog", args);
				break;
		}
	},
	
	onEvent: function (event)
	{
	}
}

window.controllers.appendController(AutoLiveTitleController);
