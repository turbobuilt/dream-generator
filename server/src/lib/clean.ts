function addOrganizationFilter(query: string, organizationId: string): string {
    const organizationFilter = `organization='${organizationId}'`;

    // Helper function to find the position of a keyword outside of parentheses
    function findKeywordOutsideParentheses(sql: string, keyword: string): number {
        let level = 0;
        for (let i = 0; i < sql.length; i++) {
            if (sql[i] === '(') {
                level++;
            } else if (sql[i] === ')') {
                level--;
            } else if (level === 0 && sql.slice(i, i + keyword.length).toUpperCase() === keyword) {
                return i;
            }
        }
        return -1;
    }

    // Find the FROM clause
    const fromIndex = findKeywordOutsideParentheses(query, 'FROM');
    if (fromIndex === -1) {
        throw new Error('Invalid query: no FROM clause found');
    }

    // Extract the table name and alias if present
    const afterFrom = query.slice(fromIndex + 4).trim();
    const tableNameMatch = afterFrom.match(/^\s*([^\s\(\)]+)(\s+AS\s+[^\s\(\)]+)?/i);
    if (!tableNameMatch) {
        throw new Error('Invalid query: unable to parse table name');
    }

    // Check for existing WHERE clause
    const whereIndex = findKeywordOutsideParentheses(query, 'WHERE');
    const joinIndex = findKeywordOutsideParentheses(query, 'JOIN');

    let modifiedQuery = query;

    if (whereIndex !== -1) {
        // There is a WHERE clause, add the organization filter
        const beforeWhere = query.slice(0, whereIndex + 5);
        const afterWhere = query.slice(whereIndex + 5).trim();
        modifiedQuery = `${beforeWhere} (${afterWhere}) AND ${organizationFilter}`;
    } else {
        // No WHERE clause, add a WHERE clause
        modifiedQuery = `${query} WHERE ${organizationFilter}`;
    }

    // Handle JOIN clauses
    let currentJoinIndex = joinIndex;
    while (currentJoinIndex !== -1) {
        const afterJoin = modifiedQuery.slice(currentJoinIndex);
        const onIndex = findKeywordOutsideParentheses(afterJoin, 'ON');
        if (onIndex === -1) {
            throw new Error('Invalid query: JOIN clause without ON');
        }
        const beforeOn = afterJoin.slice(0, onIndex + 2);
        const afterOn = afterJoin.slice(onIndex + 2).trim();
        modifiedQuery = `${modifiedQuery.slice(0, currentJoinIndex)}${beforeOn} (${afterOn}) AND ${organizationFilter}`;
        currentJoinIndex = findKeywordOutsideParentheses(modifiedQuery.slice(currentJoinIndex + beforeOn.length), 'JOIN');
        if (currentJoinIndex !== -1) {
            currentJoinIndex += currentJoinIndex + beforeOn.length;
        }
    }

    return modifiedQuery;
}

// Example usage
const complexQuery = `
SELECT 
    u.id, 
    u.name, 
    o.order_date, 
    DATE_ADD(o.order_date, INTERVAL 1 DAY) AS next_day,
    l.latest_order_date
FROM 
    users u
    JOIN orders o ON u.id = o.user_id
    LEFT JOIN LATERAL (
        SELECT MAX(order_date) AS latest_order_date 
        FROM orders 
        WHERE orders.user_id = u.id
    ) l ON true
WHERE 
    u.age > 30
    AND u.status = 'active'
`;

console.log(addOrganizationFilter(complexQuery, '123'));