import{_ as s,o as n,c as e,a4 as p}from"./chunks/framework.DzJZdBQK.js";const h=JSON.parse('{"title":"Centos7部署QuickSQL","description":"","frontmatter":{"date":"2021-05-15T13:34:12","title":"Centos7部署QuickSQL","categories":["Java","QuickSQL"],"tags":["Java","QuickSQL"]},"headers":[{"level":2,"title":"准备","slug":"准备","link":"#准备","children":[]},{"level":2,"title":"安装","slug":"安装","link":"#安装","children":[]},{"level":2,"title":"测试","slug":"测试","link":"#测试","children":[]},{"level":2,"title":"替换Mysql驱动","slug":"替换mysql驱动","link":"#替换mysql驱动","children":[]},{"level":2,"title":"采集元数据","slug":"采集元数据","link":"#采集元数据","children":[{"level":3,"title":"使用示例","slug":"使用示例","link":"#使用示例","children":[]}]},{"level":2,"title":"命令行执行","slug":"命令行执行","link":"#命令行执行","children":[{"level":3,"title":"使用示例","slug":"使用示例-1","link":"#使用示例-1","children":[]}]},{"level":2,"title":"从应用提交查询","slug":"从应用提交查询","link":"#从应用提交查询","children":[{"level":3,"title":"Server端","slug":"server端","link":"#server端","children":[]},{"level":3,"title":"Client端","slug":"client端","link":"#client端","children":[]}]},{"level":2,"title":"参考链接","slug":"参考链接","link":"#参考链接","children":[]}],"relativePath":"posts/java/quicksql-001.md","filePath":"posts/java/quicksql-001.md"}'),l={name:"posts/java/quicksql-001.md"};function t(i,a,c,r,o,d){return n(),e("div",null,[...a[0]||(a[0]=[p(`<h2 id="准备" tabindex="-1">准备 <a class="header-anchor" href="#准备" aria-label="Permalink to &quot;准备&quot;">​</a></h2><ul><li><p>Java SDK 1.8</p></li><li><p>Spark 2.4 <a href="https://www.apache.org/dyn/closer.lua/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz" target="_blank" rel="noreferrer">https://www.apache.org/dyn/closer.lua/spark/spark-2.4.7/spark-2.4.7-bin-hadoop2.7.tgz</a></p></li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>tar -xzvf spark-2.4.7-bin-hadoop2.7.tgz -C /usr/local</span></span></code></pre></div><ul><li><a href="https://github.com/Qihoo360/Quicksql/releases%EF%BC%8C%E5%BD%93%E5%89%8D%E7%89%88%E6%9C%AC%E4%B8%BA0.7.0" target="_blank" rel="noreferrer">https://github.com/Qihoo360/Quicksql/releases，当前版本为0.7.0</a></li></ul><h2 id="安装" tabindex="-1">安装 <a class="header-anchor" href="#安装" aria-label="Permalink to &quot;安装&quot;">​</a></h2><p>解压quicksql.</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>tar -xzvf quicksql-0.7.0.tar.gz -C /usr/local</span></span></code></pre></div><p>进入qsql-0.7.0目录</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cd /usr/local/qsql-0.7.0</span></span></code></pre></div><p>配置quicksql-env.sh，开启SPARK_HOME和JAVA_HOME，并设置正确的值。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> vi ./conf/quicksql-env.sh #Set Your Basic Environment.</span></span>
<span class="line"><span>export SPARK_HOME=/usr/local/spark-2.4.7-bin-hadoop2.7  # [Required] - SPARK_HOME, to set spark home for quicksql running. quicksql needs spark 2.0 or above. </span></span>
<span class="line"><span></span></span>
<span class="line"><span>export JAVA_HOME=/usr/java/jdk1.8.0_261-amd64   # [Required] - JAVA_HOME, to set java home for quicksql running. quicksql needs java 1.8 or above.</span></span></code></pre></div><h2 id="测试" tabindex="-1">测试 <a class="header-anchor" href="#测试" aria-label="Permalink to &quot;测试&quot;">​</a></h2><p>可执行quicksql-example进行测试</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>./bin/quicksql-example.sh --class com.qihoo.qsql.CsvJoinWithEsExample --runner spark</span></span></code></pre></div><p>如果能够显示以下表格，说明环境构建完毕，可以尝试新的操作。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>+------+-------+----------+--------+------+-------+------+ </span></span>
<span class="line"><span></span></span>
<span class="line"><span>|deptno|   name|      city|province|digest|   type|stu_id| </span></span>
<span class="line"><span></span></span>
<span class="line"><span>+------+-------+----------+--------+------+-------+------+ </span></span>
<span class="line"><span></span></span>
<span class="line"><span>|    45| Master|   CONCORD|      NH| 34035| Master|  null| </span></span>
<span class="line"><span></span></span>
<span class="line"><span>|    40|Scholar|  BROCKTON|      MA| 59498|Scholar|  null| </span></span>
<span class="line"><span></span></span>
<span class="line"><span>|    40|Scholar|FRAMINGHAM|      MA| 65046|Scholar|  null| </span></span>
<span class="line"><span></span></span>
<span class="line"><span>+------+-------+----------+--------+------+-------+------+</span></span></code></pre></div><h2 id="替换mysql驱动" tabindex="-1">替换Mysql驱动 <a class="header-anchor" href="#替换mysql驱动" aria-label="Permalink to &quot;替换Mysql驱动&quot;">​</a></h2><p>只要替换lib中的mysql驱动就可以了，其他驱动类似，部分驱动不支持更高版本。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>cd lib</span></span>
<span class="line"><span></span></span>
<span class="line"><span>rm -f mysql-connector-java-5.1.20.jar</span></span>
<span class="line"><span></span></span>
<span class="line"><span>cp mysql-connector-java-8.0.20.jar ./</span></span></code></pre></div><p>如果使用了spark引擎，在lib/spark目录下也有个mysql-connector-java-5.1.20.jar需要一起替换。</p><h2 id="采集元数据" tabindex="-1">采集元数据 <a class="header-anchor" href="#采集元数据" aria-label="Permalink to &quot;采集元数据&quot;">​</a></h2><p>在Quicksql上运行查询前需要将连接信息以及表、字段信息采集入库。默认元数据库使用Derby（官网说明是Sqlite）。</p><p>Quicksql提供了众多标准数据源的采集脚本，通过脚本批量拉取元数据。</p><p>目前支持通过脚本录入元数据的数据源有<strong>Hive, MySQL, Kylin, Elasticsearch, Oracle,Postgresql,Gbase-8s, MongoDB</strong>。也就是-d参数&lt;DATA-SOURCE&gt;，测试发现对数据源的大小写无要求。</p><p>执行方式如下（注意：-r 参数可以使用LIKE语法，[&#39;%&#39;: 全部匹配，&#39;_&#39;: 占位匹配，&#39;?&#39;: 可选匹配]）</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>$ ./metadata-extract.sh -p &quot;&lt;SCHEMA-JSON&gt;&quot; -d &quot;&lt;DATA-SOURCE&gt;&quot; -r &quot;&lt;TABLE-NAME-REGEX&gt;&quot;</span></span></code></pre></div><p><strong>注意，采集数据元时需要进入到bin目录。</strong></p><h3 id="使用示例" tabindex="-1">使用示例 <a class="header-anchor" href="#使用示例" aria-label="Permalink to &quot;使用示例&quot;">​</a></h3><ul><li>从<strong>MySQL</strong>数据库中采集元数据</li></ul><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>./metadata-extract.sh -p &quot;{\\&quot;jdbcDriver\\&quot;: \\&quot;com.mysql.jdbc.Driver\\&quot;, \\&quot;jdbcUrl\\&quot;: \\&quot;jdbc:mysql://\${IP}:\${PORT}/\${DATABASE}\\&quot;, \\&quot;jdbcUser\\&quot;: \\&quot;\${USERNAME}\\&quot;,\\&quot;jdbcPassword\\&quot;: \\&quot;\${PASSWORD}\\&quot;}&quot; -d &quot;mysql&quot; -r &quot;\${TABLE_NAME}&quot;</span></span></code></pre></div><p>替换\${}内容为实际值就可以了。</p><h2 id="命令行执行" tabindex="-1">命令行执行 <a class="header-anchor" href="#命令行执行" aria-label="Permalink to &quot;命令行执行&quot;">​</a></h2><p>从命令行查询是Quicksql提供的最基本的查询方式之一。</p><p>像Hive和MySQL一样，使用quicksql.sh -e &quot;YOUR SQL&quot;就可以完成查询，结果集将打印在终端上。</p><h3 id="使用示例-1" tabindex="-1"><strong>使用示例</strong> <a class="header-anchor" href="#使用示例-1" aria-label="Permalink to &quot;**使用示例**&quot;">​</a></h3><ol><li>一个简单的查询，将在Quicksql内核中被执行；</li></ol><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>$ ./bin/quicksql.sh -e &quot;SELECT 1&quot;</span></span></code></pre></div><h2 id="从应用提交查询" tabindex="-1"><strong>从应用提交查询</strong> <a class="header-anchor" href="#从应用提交查询" aria-label="Permalink to &quot;**从应用提交查询**&quot;">​</a></h2><p>Quicksql支持使用Client/Server模式的JDBC连接进行查询，用户的应用可以通过引入Driver包与Server建立连接进行联邦查询。</p><h3 id="server端" tabindex="-1"><strong>Server端</strong> <a class="header-anchor" href="#server端" aria-label="Permalink to &quot;**Server端**&quot;">​</a></h3><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>$ ./bin/quicksql-server.sh start -p 5888 -R spark -m yarn-client</span></span></code></pre></div><p>启动参数包括start|stop|restart|status，-p/-r/-m为可选项，分别对应端口号，执行引擎和任务调度方式，</p><p>-p：指定server端口号，默认为5888</p><p>-r：指定执行引擎，支持spark/flink</p><p>-m：指定spark任务资源调度方式，yarn-client或yarn-cluster等，默认为local[1]</p><h3 id="client端" tabindex="-1"><strong>Client端</strong> <a class="header-anchor" href="#client端" aria-label="Permalink to &quot;**Client端**&quot;">​</a></h3><p>项目手动加入Quicksql driver包 qsql-client-0.7.1.jar，下载地址：<a href="https://github.com/Qihoo360/Quicksql/releases%EF%BC%9B" target="_blank" rel="noreferrer">https://github.com/Qihoo360/Quicksql/releases；</a></p><p>Java代码示例：</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span> public static void main(String[] args) throws SQLException, ClassNotFoundException {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Class.forName(&quot;com.qihoo.qsql.client.Driver&quot;); //注入Drvier</span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Properties properties = new Properties();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        properties.setProperty(&quot;runner&quot;,&quot;jdbc&quot;);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        String url = &quot;jdbc:quicksql:url=http://localhost:5888&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Connection connection = DriverManager.getConnection(url,properties);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        Statement pS = connection.createStatement();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        String sql = &quot;select * from (values (&#39;a&#39;, 1), (&#39;b&#39;, 2))&quot;;</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        ResultSet rs =  pS.executeQuery(sql);</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        while (rs.next()) {</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            System.out.println(rs.getString(1));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>            System.out.println(rs.getString(2));</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        }</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        rs.close();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>        pS.close();</span></span>
<span class="line"><span></span></span>
<span class="line"><span>}</span></span></code></pre></div><p>因为替换了驱动8.0.20，查询导入的表会报错，但使用quicksql.sh时却是正常的。判断应该时程序BUG。</p><div class="language- vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang"></span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span>java.lang.RuntimeException: java.lang.ClassNotFoundException: com.mysql.jdbc.Driver </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.exec.JdbcPipeline.createSpecificConnection(JdbcPipeline.java:132) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.exec.JdbcPipeline.getConnection(JdbcPipeline.java:389) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.exec.JdbcPipeline.establishStatement(JdbcPipeline.java:336) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.exec.JdbcPipeline.collect(JdbcPipeline.java:266) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.server.QuicksqlServerMeta.getJDBCResultSet(QuicksqlServerMeta.java:807) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.server.QuicksqlServerMeta.getExecuteResultSet(QuicksqlServerMeta.java:768) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at com.qihoo.qsql.server.QuicksqlServerMeta.prepareAndExecute(QuicksqlServerMeta.java:747) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.remote.LocalService.apply(LocalService.java:206) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.remote.Service$PrepareAndExecuteRequest.accept(Service.java:927) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.remote.Service$PrepareAndExecuteRequest.accept(Service.java:879) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.remote.AbstractHandler.apply(AbstractHandler.java:94) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.remote.JsonHandler.apply(JsonHandler.java:52) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.apache.calcite.avatica.server.AvaticaJsonHandler.handle(AvaticaJsonHandler.java:130) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.server.handler.HandlerList.handle(HandlerList.java:52) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.server.handler.HandlerWrapper.handle(HandlerWrapper.java:97) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.server.Server.handle(Server.java:499) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.server.HttpChannel.handle(HttpChannel.java:311) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.server.HttpConnection.onFillable(HttpConnection.java:257) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.io.AbstractConnection$2.run(AbstractConnection.java:544) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.util.thread.QueuedThreadPool.runJob(QueuedThreadPool.java:635) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at org.eclipse.jetty.util.thread.QueuedThreadPool$3.run(QueuedThreadPool.java:555) </span></span>
<span class="line"><span></span></span>
<span class="line"><span>        at java.lang.Thread.run(Thread.java:748)</span></span></code></pre></div><p>尝试升级Pom文件的mysql版本，似乎没有作用。需要更进一步学习尝试修改。</p><p>使用MySQL5的驱动，测试连接5版本的数据库，正常。但连接8版本数据库提示的时密码策略不支持。当然可以通过修改Mysql8连接用的的密码策略来调整，但不是一个好主意。</p><h2 id="参考链接" tabindex="-1">参考链接 <a class="header-anchor" href="#参考链接" aria-label="Permalink to &quot;参考链接&quot;">​</a></h2><p><a href="https://quicksql.readthedocs.io/en/latest/reference/getting-started/" target="_blank" rel="noreferrer">Getting Started - Quick SQL</a></p><hr><p>欢迎联系我</p><p>微信号 ：Crazy_Airhead</p><p>Mixin ID : 1091586</p><p>定投课堂邀请码：6DYMBFP061</p><p>李笑来写作课邀请码：38MDGFYZK8</p><p>水龙头邀请码：FDJQHJ</p>`,62)])])}const v=s(l,[["render",t]]);export{h as __pageData,v as default};
