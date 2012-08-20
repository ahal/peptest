/* Any copyright is dedicated to the Public Domain.
 * http://creativecommons.org/publicdomain/zero/1.0/ */
let sites = ['thesartorialist.blogspot.com/thesartorialist.blogspot.com/index.html',
             'cakewrecks.blogspot.com/cakewrecks.blogspot.com/index.html',
             'baidu.com/www.baidu.com/s@wd=mozilla.html',
             'en.wikipedia.org/en.wikipedia.org/wiki/Rorschach_test.html',
             'twitter.com/twitter.com/ICHCheezburger.html',
             'msn.com/www.msn.com/index.html',
             'yahoo.co.jp/www.yahoo.co.jp/index.html',
             'amazon.com/www.amazon.com/Kindle-Wireless-Reader-Wifi-Graphite/dp/B002Y27P3M/507846.html',
             'linkedin.com/www.linkedin.com/in/christopherblizzard@goback=.nppvan_%252Flemuelf.html',
             'bing.com/www.bing.com/search@q=mozilla&go=&form=QBLH&qs=n&sk=&sc=8-0.html',
             'icanhascheezburger.com/icanhascheezburger.com/index.html',
             'yandex.ru/yandex.ru/yandsearch@text=mozilla&lr=21215.html',
             'cgi.ebay.com/cgi.ebay.com/ALL-NEW-KINDLE-3-eBOOK-WIRELESS-READING-DEVICE-W-WIFI-/130496077314@pt=LH_DefaultDomain_0&hash=item1e622c1e02.html',
             '163.com/www.163.com/index.html',
             'mail.ru/mail.ru/index.html',
             'bbc.co.uk/www.bbc.co.uk/news/index.html',
             'store.apple.com/store.apple.com/us@mco=Nzc1MjMwNA.html',
             'imdb.com/www.imdb.com/title/tt1099212/index.html',
             'mozilla.com/www.mozilla.com/en-US/firefox/all-older.html',
             'ask.com/www.ask.com/web@q=What%27s+the+difference+between+brown+and+white+eggs%253F&gc=1&qsrc=3045&o=0&l=dir.html',
             'cnn.com/www.cnn.com/index.html',
             'sohu.com/www.sohu.com/index.html',
             'vkontakte.ru/vkontakte.ru/help.php@page=about.html',
             'youku.com/www.youku.com/index.html',
             'myparentswereawesome.tumblr.com/myparentswereawesome.tumblr.com/index.html',
             'ifeng.com/ifeng.com/index.html',
             'ameblo.jp/ameblo.jp/index.html',
             'tudou.com/www.tudou.com/index.html',
             'chemistry.about.com/chemistry.about.com/index.html',
             'beatonna.livejournal.com/beatonna.livejournal.com/index.html',
             'hao123.com/hao123.com/index.html',
             'rakuten.co.jp/www.rakuten.co.jp/index.html',
             'alibaba.com/www.alibaba.com/product-tp/101509462/World_s_Cheapest_Laptop.html',
             'uol.com.br/www.uol.com.br/index.html',
             'cnet.com/www.cnet.com/index.html',
             'ehow.com/www.ehow.com/how_4575878_prevent-fire-home.html',
             'thepiratebay.org/thepiratebay.org/top/201.html',
             'page.renren.com/page.renren.com/index.html',
             'chinaz.com/chinaz.com/index.html',
             'globo.com/www.globo.com/index.html',
             'spiegel.de/www.spiegel.de/index.html',
             'dailymotion.com/www.dailymotion.com/us.html',
             'goo.ne.jp/goo.ne.jp/index.html',
             'alipay.com/www.alipay.com/index.html',
             'stackoverflow.com/stackoverflow.com/questions/184618/what-is-the-best-comment-in-source-code-you-have-ever-encountered.html',
             'nicovideo.jp/www.nicovideo.jp/index.html',
             'ezinearticles.com/ezinearticles.com/index.html@Migraine-Ocular---The-Eye-Migraines&id=4684133.html',
             'taringa.net/www.taringa.net/index.html',
             'tmall.com/www.tmall.com/index.html@ver=2010s.html',
             'huffingtonpost.com/www.huffingtonpost.com/index.html',
             'deviantart.com/www.deviantart.com/index.html',
             'media.photobucket.com/media.photobucket.com/image/funny%20gif/findstuff22/Best%20Images/Funny/funny-gif1.jpg@o=1.html',
             'douban.com/www.douban.com/index.html',
             'imgur.com/imgur.com/gallery/index.html',
             'reddit.com/www.reddit.com/index.html',
             'digg.com/digg.com/news/story/New_logo_for_Mozilla_Firefox_browser.html',
             'filestube.com/www.filestube.com/t/the+vampire+diaries.html',
             'dailymail.co.uk/www.dailymail.co.uk/ushome/index.html',
             'whois.domaintools.com/whois.domaintools.com/mozilla.com.html',
             'indiatimes.com/www.indiatimes.com/index.html',
             'rambler.ru/www.rambler.ru/index.html',
             'torrentz.eu/torrentz.eu/search@q=movies.html',
             'reuters.com/www.reuters.com/index.html',
             'foxnews.com/www.foxnews.com/index.html',
             'xinhuanet.com/xinhuanet.com/index.html',
             '56.com/www.56.com/index.html',
             'bild.de/www.bild.de/index.html',
             'guardian.co.uk/www.guardian.co.uk/index.html',
             'w3schools.com/www.w3schools.com/html/default.asp.html',
             'naver.com/www.naver.com/index.html',
             'blogfa.com/blogfa.com/index.html',
             'terra.com.br/www.terra.com.br/portal/index.html',
             'ucoz.ru/www.ucoz.ru/index.html',
             'yelp.com/www.yelp.com/biz/alexanders-steakhouse-cupertino.html',
             'wsj.com/online.wsj.com/home-page.html',
             'noimpactman.typepad.com/noimpactman.typepad.com/index.html',
             'myspace.com/www.myspace.com/albumart.html',
             'google.com/www.google.com/search@q=mozilla.html',
             'orange.fr/www.orange.fr/index.html',
             'php.net/php.net/index.html',
             'zol.com.cn/www.zol.com.cn/index.html',
             'mashable.com/mashable.com/index.html',
             'etsy.com/www.etsy.com/category/geekery/videogame.html',
             'gmx.net/www.gmx.net/index.html',
             'csdn.net/csdn.net/index.html',
             'xunlei.com/xunlei.com/index.html',
             'hatena.ne.jp/www.hatena.ne.jp/index.html',
             'icious.com/www.delicious.com/index.html',
             'repubblica.it/www.repubblica.it/index.html',
             'web.de/web.de/index.html',
             'slideshare.net/www.slideshare.net/jameswillamor/lolcats-in-popular-culture-a-historical-perspective.html',
             'telegraph.co.uk/www.telegraph.co.uk/index.html',
             'seesaa.net/blog.seesaa.jp/index.html',
             'wp.pl/www.wp.pl/index.html',
             'aljazeera.net/aljazeera.net/portal.html',
             'w3.org/www.w3.org/standards/webdesign/htmlcss.html',
             'homeway.com.cn/www.hexun.com/index.html',
             'facebook.com/www.facebook.com/Google.html',
             'youtube.com/www.youtube.com/music.html',
             'people.com.cn/people.com.cn/index.html'];

Components.utils.import('resource://mozmill/driver/mozmill.js');
let c = getBrowserController();
let win = pep.getWindow();

// load all of the test pages in a separate tab
for (let i = 0; i < sites.length; ++i) {
  c.rootElement.keypress('t', {'accelKey': true});
  c.open(sites[i]);
  // it doesn't really matter if the page times out loading
  try {
    c.waitForPageLoad();
  } catch (e) {}
}

let tabbrowser = win.document.getElementById('tabbrowser-tabs');
let tabs = tabbrowser.getElementsByTagName('tab');

// switch between all the tabs
pep.performAction('switch_tabs', function() {
  for (let i = 0; i < tabs.length; ++i) {
    c.rootElement.keypress('VK_TAB', {'accelKey': true});
    c.sleep(500);
  }
});
