<?php

namespace Wpae\WordPress;


class OrderQuery
{

    public $query = ['post_type' => 'shop_order'];

    public function getOrders($offset = 0, $limit = 0)
    {
        global $wpdb;

        $query = $this->getQuery($offset, $limit);

        return $wpdb->get_results($query);
    }

    public function getQuery($offset = 0, $limit = 0) {

        global $wpdb;

        $defaultQuery = "SELECT * FROM {$wpdb->prefix}wc_orders ";

        if(!\PMXE_Plugin::$session) {
            $customWhere = \XmlExportEngine::$exportOptions['whereclause'];
            $customJoins = \XmlExportEngine::$exportOptions['joinclause'];
        } else {
            $customWhere = \PMXE_Plugin::$session->get('whereclause');
            $customJoins = \PMXE_Plugin::$session->get('joinclause');
        }
        if (count($customJoins)) {
            foreach($customJoins as $join) {
                $defaultQuery = $defaultQuery . $join;
            }
        }

        $defaultQuery .= " WHERE status != 'auto-draft' AND type != 'shop_order_refund' ";

        $defaultQuery = $defaultQuery . $customWhere;

        $export_id = $this->get_export_id();
        $export = new \PMXE_Export_Record();
        $export->getById($export_id);

        if ($this->is_export_new_stuff()) {

            if ($export->iteration > 0) {
                $postsToExclude = array();
                $postList = new \PMXE_Post_List();

                $postsToExcludeSql = 'SELECT post_id FROM ' . $postList->getTable() . ' WHERE export_id = %d AND iteration < %d';
                $results = $wpdb->get_results($wpdb->prepare($postsToExcludeSql, $export->id, $export->iteration));

                foreach ($results as $result) {
                    $postsToExclude[] = $result->post_id;
                }

                if (count($postsToExclude)) {
                    $defaultQuery .= $this->get_exclude_query_where($postsToExclude);
                }
            }
        }


        if ($this->is_export_modfified_stuff() && !empty($export->registered_on)) {

            $export_id = $this->get_export_id();
            $export = new \PMXE_Export_Record();
            $export->getById($export_id);

            $defaultQuery .= $this->get_modified_query_where($export);
        }


        if (isset($offset) && isset($limit) && $limit) {
            $limit_query = " LIMIT $offset, $limit ";
            $defaultQuery = $defaultQuery . $limit_query;
        }

        return $defaultQuery;
    }

    public function get_exclude_query_where($postsToExclude)
    {
        global $wpdb;

        return " AND ({$wpdb->prefix}wc_orders.id NOT IN (" . implode(',', $postsToExclude) . "))";

    }

    public function get_modified_query_where($export)
    {
        global $wpdb;

        return " AND {$wpdb->prefix}wc_orders.date_updated_gmt > '" . $export->registered_on . "' ";
    }

    /**
     * @return bool
     */
    protected function is_export_new_stuff()
    {

        $export_id = $this->get_export_id();

        return (!empty(\XmlExportEngine::$exportOptions['export_only_new_stuff']) &&
            $export_id);
    }

    /**
     * @return bool
     */
    protected function is_export_modfified_stuff()
    {

        $export_id = $this->get_export_id();

        return (!empty(\XmlExportEngine::$exportOptions['export_only_modified_stuff']) &&
            $export_id);
    }

    private function get_export_id()
    {
        $input = new \PMXE_Input();
        $export_id = $input->get('id', 0);

        if(!$export_id) {
            $export_id = $input->get('export_id', 0);
        }

        return $export_id;
    }

}