module.exports = {
    /**
     * class="page" css对应设计名称
     * @param {number} pagesize 每页显示数量
     * @param {number} dataCount 总量数
     * @param {string} page 前端传输的当前页面
     * @param {number} keyword 模糊查询的关键字
     * @param {number} pageCount 所需显示的总页数
     * @param {string} UpPage 上一页的a标签
     * @param {string} DowPage 下一页的a标签
     * @param {string} EsayReturn 返回拼接好的分页模板
     */
    Easy_classification: function (pagesize, dataCount, page, keyword = '') {
        let pageCount = Math.ceil(dataCount / pagesize)
        let UpPage = '';
        let DowPage = ''
        if (page < 1) {
            page = 1
        }
        if (page > pageCount) {
            page = pageCount
        }
        if (page > 1) {
            UpPage = `<a href="?page=${page - 1}&${keyword}" class="page"> 上一页</a>`
        }
        if (page < pageCount) {
            DowPage = ` <a href="?page=${Number(page) + 1}&${keyword}" class="page"> 下一页</a>`
        }
        let EsayReturn =
            `当前:${page}/${pageCount}页<a href="?page=1&${keyword}" class="page"> 首页</a>` + UpPage + `` + DowPage +
            ` <a href="?page=${pageCount}&${keyword}" class="page"> 尾页</a>`
        return EsayReturn
    },


    /**
     * 
     * class="page" css对应页数class
     * class="arrow"  css对应箭头class
     * @param {number} pagesize //每页显示数量
     * @param {number} dataCount //总查询量
     * @param {string} page //当前页
     * @param {number} keyword //模糊查询参数
     * @param {number} pageCount //总页数
     * @param {string} pageAmount //1234567等页(所需展示页数)
     * @param {number} DefaultNode //默认节点（就是多少开始第一个数就不是一的节点）
     * @param {number} TraversalLength //遍历长度，也就是始终大于page的最末端点
     * @param {number} UpPage     //上一页
     * @param {number} DownPage    //下一页
     * @param {string} NumberPageReturn//拼接好的分页模板
     * @returns 
     */
    Difficult_Paging: function (pagesize, dataCount, page, keyword = '') {
        let pageCount = Math.ceil(dataCount / pagesize)
        let pageAmount = '';
        let DefaultNode = 5
        let x = 1;
        let TraversalLength = '';
        let UpPage = '';
        let DownPage = ''
        if (page > DefaultNode) {
            x = page - DefaultNode;
            if (x + 10 <= Number(page) + 4) {

            }

            if (pageCount >= Number(page) + 4) {
                TraversalLength = Number(page) + 4
            } else {
                TraversalLength = pageCount
            }
        } else {
            if (pageCount < 10) {
                TraversalLength = pageCount;//默认页数长为总页数
            } else {
                TraversalLength = 10;
            }

        }
        if (pageCount > DefaultNode) {
            if (x + 10 > TraversalLength) {
                x = TraversalLength - 9
                if(x <1){
                    x = 1
                }
            }
        }
        for (; x <= TraversalLength; x++) {
            if (x == page) {
                pageAmount += `<a href="?page=${x}&${keyword}" class="page nowPage">${x}</a>`
            } else {
                pageAmount += `<a href="?page=${x}&${keyword}" class="page ">${x}</a>`
            }
        }

        if (page > 1) {
            UpPage = page - 1
        } else {
            UpPage = 1
        }

        if (page < pageCount) {
            DownPage = Number(page) + 1
        } else {
            DownPage = pageCount
        }
        let NumberPageReturn =`当前:${page}/${pageCount}页`+
            `<a href="?page=${UpPage}&${keyword}" class="arrow"> 上一页</a>` +
            pageAmount +
            `<a href="?page=${DownPage}&${keyword}" class="arrow"> 下一页 </a>`
        return NumberPageReturn
    }
}

